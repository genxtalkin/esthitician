
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { MindNode, MindLink, GraphData } from '../types';
import { CATEGORY_COLORS } from '../constants';

interface MindMapProps {
  data: GraphData;
  onNodeClick: (node: MindNode) => void;
  selectedNodeId?: string;
}

const MindMap: React.FC<MindMapProps> = ({ data, onNodeClick, selectedNodeId }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      if (svgRef.current) {
        setDimensions({
          width: svgRef.current.parentElement?.clientWidth || 800,
          height: svgRef.current.parentElement?.clientHeight || 600
        });
      }
    };
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg.append('g');

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Initial positioning
    const simulation = d3.forceSimulation<MindNode>(data.nodes)
      .force('link', d3.forceLink<MindNode, MindLink>(data.links)
        .id(d => d.id)
        .distance(120)
      )
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
      .force('collision', d3.forceCollide().radius(60));

    // Links
    const link = g.append('g')
      .selectAll('line')
      .data(data.links)
      .enter()
      .append('line')
      .attr('stroke', '#e2e8f0')
      .attr('stroke-width', 2);

    // Node Containers
    const node = g.append('g')
      .selectAll('g')
      .data(data.nodes)
      .enter()
      .append('g')
      .attr('class', 'node-group cursor-pointer')
      .on('click', (event, d) => onNodeClick(d))
      .call(d3.drag<SVGGElement, MindNode>()
        .on('start', (event) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          event.subject.fx = event.subject.x;
          event.subject.fy = event.subject.y;
        })
        .on('drag', (event) => {
          event.subject.fx = event.x;
          event.subject.fy = event.y;
        })
        .on('end', (event) => {
          if (!event.active) simulation.alphaTarget(0);
          event.subject.fx = null;
          event.subject.fy = null;
        }) as any
      );

    // Node Circles
    node.append('circle')
      .attr('r', d => d.id === 'esthetician' ? 35 : 25)
      .attr('fill', d => CATEGORY_COLORS[d.category])
      .attr('stroke', d => d.id === selectedNodeId ? '#000' : 'white')
      .attr('stroke-width', d => d.id === selectedNodeId ? 3 : 2)
      .attr('filter', 'drop-shadow(0 4px 3px rgb(0 0 0 / 0.07))');

    // Node Labels
    node.append('text')
      .text(d => d.label)
      .attr('dy', 40)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', '500')
      .attr('fill', '#475569');

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as any).x)
        .attr('y1', d => (d.source as any).y)
        .attr('x2', d => (d.target as any).x)
        .attr('y2', d => (d.target as any).y);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

  }, [data, dimensions, onNodeClick, selectedNodeId]);

  return (
    <svg 
      ref={svgRef} 
      className="w-full h-full bg-[#faf9f6]"
      style={{ touchAction: 'none' }}
    />
  );
};

export default MindMap;
