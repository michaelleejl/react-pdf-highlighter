import React, { useState } from "react";
import type { IHighlight } from "./react-pdf-highlighter";
import { SegmentedControl } from "ios-segmented-control-react"
interface Props {
  highlights: Array<IHighlight>;
  resetHighlights: () => void;
  toggleDocument: () => void;
}

const updateHash = (highlight: IHighlight) => {
  document.location.hash = `highlight-${highlight.id}`;
};

export function Sidebar({
  highlights,
  toggleDocument,
  resetHighlights,
}: Props) {
  let [filter, setFilter] = useState<(highlight: IHighlight) => Boolean>(() => (highlight:IHighlight)=>true)
  return (
    <div className="sidebar" style={{ width: "25vw" }}>
      <div className="description" style={{ padding: "1rem" }}>
        <h2 style={{ marginBottom: "1rem" }}>react-pdf-highlighter</h2>

        <p style={{ fontSize: "0.7rem" }}>
          <a href="https://github.com/agentcooper/react-pdf-highlighter">
            Open in GitHub
          </a>
        </p>
      </div>

      <SegmentedControl
        segments = {[
          {label: 'All', value:"all"},
          {label: 'Pending', value:'pending'},
          {label: 'Reviewed', value:'reviewed'}
        ]}
        onChangeSegment={(newValue) => {
          switch (newValue){
            case "all":
              setFilter(() => (highlight:IHighlight)=>true);
              break;
            case "pending":
              setFilter(() => (highlight:IHighlight) => highlight.comment.status == "pending")
              break;
            case "reviewed":
              setFilter(() => (highlight:IHighlight) => highlight.comment.status == "verified" || highlight.comment.status == "rejected")
          }
        }}
      />

      <ul className="sidebar__highlights">
        {highlights
          .filter(filter)
          .map((highlight, index) => (
          <li
            key={index}
            className="sidebar__highlight"
            onClick={() => {
              updateHash(highlight);
            }}
          >
            <div>
              <strong>{highlight.comment.text}</strong>
              {highlight.content.text ? (
                <blockquote style={{ marginTop: "0.5rem" }}>
                  {`${highlight.content.text.slice(0, 90).trim()}…`}
                </blockquote>
              ) : null}
              {highlight.content.image ? (
                <div
                  className="highlight__image"
                  style={{ marginTop: "0.5rem" }}
                >
                  <img src={highlight.content.image} alt={"Screenshot"} />
                </div>
              ) : null}
            </div>
            <div className="highlight__location">
              Page {highlight.position.pageNumber}
            </div>
          </li>
        ))}
      </ul>
      <div style={{ padding: "1rem" }}>
        <button onClick={toggleDocument}>Toggle PDF document</button>
      </div>
      {highlights.length > 0 ? (
        <div style={{ padding: "1rem" }}>
          <button onClick={resetHighlights}>Reset highlights</button>
        </div>
      ) : null}
    </div>
  );
}
