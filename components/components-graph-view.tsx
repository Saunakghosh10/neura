'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import type { Note } from '@/types/note'

interface SimulationNote extends Note, d3.SimulationNodeDatum {}

interface GraphViewComponentProps {
  notes: Note[]
  activeNote: Note | null
  onSelectNote: (note: Note) => void
}

export function GraphViewComponent({ notes, activeNote, onSelectNote }: GraphViewComponentProps) {
  const svgRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    if (!notes.length || !svgRef.current) return

    const svg = d3.select(svgRef.current)
    const width = 500
    const height = 500

    svg.attr('width', width).attr('height', height)

    // Clear previous content
    svg.selectAll('*').remove()

    // Convert notes to simulation nodes
    const simulationNodes: SimulationNote[] = notes.map(note => ({
      ...note,
      x: undefined,
      y: undefined,
      vx: undefined,
      vy: undefined,
      fx: undefined,
      fy: undefined,
    }))

    const simulation = d3.forceSimulation<SimulationNote>(simulationNodes)
      .force('charge', d3.forceManyBody().strength(-50))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30))

    // Create links data
    const links = getLinks(notes).map(link => ({
      source: simulationNodes.find(n => n.id === link.source)!,
      target: simulationNodes.find(n => n.id === link.target)!
    }))

    // Add links force
    simulation.force('link', d3.forceLink<SimulationNote, d3.SimulationLinkDatum<SimulationNote>>(links)
      .id(d => d.id)
      .distance(100))

    const linkElements = svg.selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)

    const nodes = svg.selectAll('circle')
      .data(simulationNodes)
      .enter().append('circle')
      .attr('r', 5)
      .attr('fill', d => d.id === (activeNote?.id) ? '#7c3aed' : '#4b5563')
      .call(d3.drag<SVGCircleElement, SimulationNote>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))
      .on('click', (event, d) => onSelectNote(d))

    simulation.on('tick', () => {
      linkElements
        .attr('x1', d => (d.source as SimulationNote).x!)
        .attr('y1', d => (d.source as SimulationNote).y!)
        .attr('x2', d => (d.target as SimulationNote).x!)
        .attr('y2', d => (d.target as SimulationNote).y!)

      nodes
        .attr('cx', d => d.x!)
        .attr('cy', d => d.y!)
    })

    function dragstarted(event: d3.D3DragEvent<SVGCircleElement, SimulationNote, SimulationNote>) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      event.subject.fx = event.subject.x
      event.subject.fy = event.subject.y
    }

    function dragged(event: d3.D3DragEvent<SVGCircleElement, SimulationNote, SimulationNote>) {
      event.subject.fx = event.x
      event.subject.fy = event.y
    }

    function dragended(event: d3.D3DragEvent<SVGCircleElement, SimulationNote, SimulationNote>) {
      if (!event.active) simulation.alphaTarget(0)
      event.subject.fx = null
      event.subject.fy = null
    }

    return () => {
      simulation.stop()
    }
  }, [notes, activeNote, onSelectNote])

  return (
    <svg 
      ref={svgRef}
      className="w-full h-full bg-background/50 backdrop-blur-sm rounded-lg"
    />
  )
}

function getLinks(notes: Note[]) {
  const links: Array<{ source: string; target: string }> = []
  notes.forEach(note => {
    if (note.linkedTo) {
      note.linkedTo.forEach(link => {
        links.push({
          source: note.id,
          target: link.sourceNote.id
        })
      })
    }
  })
  return links
}