import React, { Component, useState } from "react";

import { Rnd } from "react-rnd";
import { getPageFromElement } from "../lib/pdfjs-dom";

import "../style/AreaHighlight.css";

import type { LTWHP, ViewportHighlight } from "../types";

interface Props {
  highlight: ViewportHighlight;
  onChange: (rect: LTWHP) => void;
  isScrolledTo: boolean;
}

interface State {
  hover: boolean;
}


const handleClick = (e: { type: string; }) => {
  if (e.type === 'click') {
    console.log('Left click');
  } else if (e.type === 'contextmenu') {
    console.log('Right click');
  }
};

export class AreaHighlight extends Component<Props, State> {
  constructor(props: Props){
    super(props);
    this.state = {
      hover: true
    };
  }
  render() {
    const { highlight, onChange, isScrolledTo, ...otherProps } = this.props;
    return (
      <div
        className={`AreaHighlight ${
          isScrolledTo ? "AreaHighlight--scrolledTo" : ""
        } `}
          onMouseEnter={() => {this.setState({ hover: true }); console.log(this.state.hover)}}
          onMouseLeave={() => {this.setState({ hover: false }); console.log(this.state.hover)}}
          style={{opacity: this.state.hover ? 1.0 : 0.3}}
          onClick={handleClick}
          onContextMenu={handleClick}
      >
        <Rnd
          className={`AreaHighlight__part ${highlight.comment.status}`}
          onDragStop={(_, data) => {
            const boundingRect: LTWHP = {
              ...highlight.position.boundingRect,
              top: data.y,
              left: data.x,
            };

            onChange(boundingRect);
          }}
          onResizeStop={(_mouseEvent, _direction, ref, _delta, position) => {
            const boundingRect: LTWHP = {
              top: position.y,
              left: position.x,
              width: ref.offsetWidth,
              height: ref.offsetHeight,
              pageNumber: getPageFromElement(ref)?.number || -1,
            };

            onChange(boundingRect);
          }}
          position={{
            x: highlight.position.boundingRect.left,
            y: highlight.position.boundingRect.top,
          }}
          size={{
            width: highlight.position.boundingRect.width,
            height: highlight.position.boundingRect.height,
          }}
          onClick={(event: Event) => {
            event.stopPropagation();
            event.preventDefault();
          }}
          {...otherProps}
        />
      </div>
    );
  }
}

export default AreaHighlight;
