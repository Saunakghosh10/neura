'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { motion } from 'framer-motion'
import type { FileSystemItem } from '@/store/use-file-system'

interface GraphViewProps {
  items: FileSystemItem[]
  activeItemId: string | null
  onSelectItem: (id: string) => void
}

interface SimulationNode extends d3.SimulationNodeDatum {
  id: string
  name: string
  type: 'file' | 'folder'
  content?: string
}

interface SimulationLink extends d3.SimulationLinkDatum<SimulationNode> {
  source: SimulationNode
  target: SimulationNode
}

function extractLinks(content: string): string[] {
  const linkRegex = /\[\[(.*?)\]\]/g
  const matches = content.match(linkRegex) || []
  return matches.map(match => match.slice(2, -2))
}

export function GraphView({ items, activeItemId, onSelectItem }: GraphViewProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !items.length) return

    // Clear previous graph
    d3.select(svgRef.current).selectAll('*').remove()

    // Setup dimensions
    const width = svgRef.current.clientWidth
    const height = svgRef.current.clientHeight
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)

    // Create nodes from files only (exclude folders)
    const nodes: SimulationNode[] = items
      .filter(item => item.type === 'file')
      .map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        content: item.content,
        x: width / 2 + Math.random() * 50,
        y: height / 2 + Math.random() * 50
      }))

    // Create links based on markdown-style links
    const links: SimulationLink[] = []
    nodes.forEach(sourceNode => {
      if (sourceNode.content) {
        const linkedTitles = extractLinks(sourceNode.content)
        linkedTitles.forEach(linkedTitle => {
          const targetNode = nodes.find(n => 
            n.name.toLowerCase().replace('.md', '') === linkedTitle.toLowerCase()
          )
          if (targetNode) {
            links.push({
              source: sourceNode,
              target: targetNode
            })
          }
        })
      }
    })

    // Create simulation
    const simulation = d3.forceSimulation<SimulationNode>(nodes)
      .force('link', d3.forceLink<SimulationNode, SimulationLink>(links)
        .id(d => d.id)
        .distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50))

    // Create links
    const link = svg.append('g')
      .selectAll('line')
      .data<SimulationLink>(links)
      .join('line')
      .attr('stroke', '#666')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 1.5)

    // Create nodes
    const node = svg.append('g')
      .selectAll<SVGGElement, SimulationNode>('g')
      .data(nodes)
      .join('g')
      .attr('cursor', 'pointer')
      .call(d3.drag<SVGGElement, SimulationNode>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))
      .on('click', (event, d) => onSelectItem(d.id))

    // Add circles to nodes
    node.append('circle')
      .attr('r', 20)
      .attr('fill', d => d.id === activeItemId ? '#7c3aed' : '#4b5563')
      .attr('stroke', '#9ca3af')
      .attr('stroke-width', 2)

    // Add labels to nodes
    node.append('text')
      .text(d => d.name.replace('.md', ''))
      .attr('text-anchor', 'middle')
      .attr('dy', 30)
      .attr('fill', '#e5e7eb')
      .attr('font-size', 12)

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x!)
        .attr('y1', d => d.source.y!)
        .attr('x2', d => d.target.x!)
        .attr('y2', d => d.target.y!)

      node
        .attr('transform', d => `translate(${d.x},${d.y})`)
    })

    // Drag functions
    function dragstarted(event: d3.D3DragEvent<SVGGElement, SimulationNode, SimulationNode>) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      event.subject.fx = event.subject.x
      event.subject.fy = event.subject.y
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, SimulationNode, SimulationNode>) {
      event.subject.fx = event.x
      event.subject.fy = event.y
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, SimulationNode, SimulationNode>) {
      if (!event.active) simulation.alphaTarget(0)
      event.subject.fx = null
      event.subject.fy = null
    }

    return () => {
      simulation.stop()
    }
  }, [items, activeItemId, onSelectItem])

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full h-full bg-background/50 backdrop-blur-sm rounded-lg"
    >
      <svg 
        ref={svgRef} 
        className="w-full h-full"
      />
    </motion.div>
  )
} 