"use client";

import { useEffect, useRef } from "react";
import * as d3 from "d3";
import speciesData from "@/data/species-graph.json";

interface Props {
  coralCover: number;
  collapsedIds: string[];
}

export default function SpeciesGraph({ coralCover, collapsedIds }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !wrapperRef.current) return;

    const width = wrapperRef.current.clientWidth;
    const height = wrapperRef.current.clientHeight;

    // Deep copy data for D3 force mutation
    const nodes = speciesData.nodes.map(d => ({...d}));
    const links = speciesData.edges.map(d => ({...d}));

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);
    
    svg.selectAll("*").remove(); // Clear previous

    const simulation = d3.forceSimulation(nodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(120))
      .force("charge", d3.forceManyBody().strength(-800))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(50));

    // Arrow marker for directed edges
    svg.append("defs").append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "-0 -5 10 10")
      .attr("refX", 25)
      .attr("refY", 0)
      .attr("orient", "auto")
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("xoverflow", "visible")
      .append("svg:path")
      .attr("d", "M 0,-5 L 10 ,0 L 0,5")
      .attr("fill", "var(--text-muted)")
      .style("stroke","none");

    const link = svg.append("g")
      .attr("class", "links")
      .selectAll("path")
      .data(links)
      .enter().append("path")
      .attr("stroke", d => {
         // If either source or target is collapsed, fade the link
         const sourceId = typeof d.source === "object" ? (d.source as any).id : d.source;
         const targetId = typeof d.target === "object" ? (d.target as any).id : d.target;
         if (collapsedIds.includes(sourceId) || collapsedIds.includes(targetId)) return "rgba(255,255,255,0.05)";
         return "var(--border-subtle)";
      })
      .attr("stroke-width", d => d.strength * 4)
      .attr("fill", "none")
      .attr("marker-end", d => {
         const sourceId = typeof d.source === "object" ? (d.source as any).id : d.source;
         const targetId = typeof d.target === "object" ? (d.target as any).id : d.target;
         return collapsedIds.includes(sourceId) || collapsedIds.includes(targetId) ? "" : "url(#arrowhead)";
      });

    const node = svg.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(nodes)
      .enter().append("g")
      .call(d3.drag<any, any>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    // Node circles with glow
    const defs = svg.append("defs");
    // Glow filter
    const filter = defs.append("filter").attr("id", "glow");
    filter.append("feGaussianBlur").attr("stdDeviation", "4").attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    node.append("circle")
      .attr("r", d => d.id === "coral" ? 35 : 25)
      .attr("fill", "var(--bg-card)")
      .attr("stroke", d => d.color)
      .attr("stroke-width", 3)
      .style("filter", d => collapsedIds.includes(d.id) ? "none" : "url(#glow)")
      .style("opacity", d => collapsedIds.includes(d.id) ? 0.3 : 1)
      .style("transition", "all 0.5s ease");

    // Icons inside nodes
    node.append("text")
      .attr("dx", 0)
      .attr("dy", 6)
      .attr("text-anchor", "middle")
      .style("font-size", d => d.id === "coral" ? "24px" : "18px")
      .text(d => d.icon)
      .style("opacity", d => collapsedIds.includes(d.id) ? 0.3 : 1);

    // Labels outside
    node.append("text")
      .attr("dx", 0)
      .attr("dy", d => d.id === "coral" ? 55 : 45)
      .attr("text-anchor", "middle")
      .text(d => d.name)
      .style("fill", "var(--text-primary)")
      .style("font-size", "12px")
      .style("font-family", "var(--font-sans)")
      .style("font-weight", "500")
      .style("opacity", d => collapsedIds.includes(d.id) ? 0.4 : 1);

    // Coral percentage special label
    svg.append("text")
      .attr("class", "coral-label")
      .attr("text-anchor", "middle")
      .style("fill", coralCover < 60 ? "var(--coral)" : "var(--teal)")
      .style("font-size", "14px")
      .style("font-family", "var(--font-mono)")
      .style("font-weight", "bold");

    simulation.on("tick", () => {
      link.attr("d", (d: any) => {
        const dx = d.target.x - d.source.x;
        const dy = d.target.y - d.source.y;
        const dr = Math.sqrt(dx * dx + dy * dy);
        return `M${d.source.x},${d.source.y}A${dr},${dr} 0 0,1 ${d.target.x},${d.target.y}`;
      });

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);

      const cNode = nodes.find(n => n.id === "coral") as any;
      if (cNode) {
         svg.select(".coral-label")
           .attr("x", cNode.x)
           .attr("y", cNode.y - 45)
           .text(`Cover: ${coralCover}%`);
      }
    });

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => {
      simulation.stop();
    };

  }, [coralCover, collapsedIds]);

  return (
    <div ref={wrapperRef} style={{ width: "100%", height: "100%", minHeight: "500px" }}>
      <svg ref={svgRef}></svg>
    </div>
  );
}
