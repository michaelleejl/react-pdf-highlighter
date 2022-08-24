import React, { Component, useState } from "react";

import { Rnd } from "react-rnd";
import { getPageFromElement } from "../lib/pdfjs-dom";

import "../style/AreaHighlight.css";

import type { IHighlight, LTWHP, ViewportHighlight } from "../types";

interface Props {
  highlight: ViewportHighlight;
  onChange: (rect: LTWHP) => void;
  isScrolledTo: boolean;
  onEnter: () => void;
}

interface State {
  hover: boolean;
  selected: boolean;
}

export class AreaHighlight extends Component<Props, State> {
  wrapperRef: React.RefObject<any>;

  constructor(props: Props){
    super(props);
    this.state = {
      hover: false,
      selected: props.isScrolledTo
    };
    this.wrapperRef = React.createRef();
    this.handleClickOutside = this.handleClickOutside.bind(this);
  }

  componentDidMount() {
    document.addEventListener("mousedown", this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside);
  }

  handleClickOutside(event: { target: any; }) {
    if (this.wrapperRef && !this.wrapperRef.current.contains(event.target)) {
      this.setState({ selected: false })
    }
  }

  render() {
    const { highlight, onChange, isScrolledTo, onEnter, ...otherProps } = this.props;
    return (
      <div
        ref={this.wrapperRef}
        className={`AreaHighlight ${
          isScrolledTo ? "AreaHighlight--scrolledTo" : ""
        } `}
        onKeyDown={(e:any) => {
          if (e.key === 'Enter'){
            highlight.comment.status = 'verified'
            this.setState({ hover: false, selected: false })
            onEnter()
          }
        }}
        tabIndex={0}
      >
        <Rnd
          ref={this.wrapperRef}
          className={`AreaHighlight__part ${highlight.comment.status}`}
          onMouseEnter={() => {this.setState({ hover: true })}}
          onMouseLeave={() => {this.setState({ hover: false })}}
          style={{opacity: this.state.hover ? 1.0 : (this.state.selected ? 1.0 : 0.3)}}
          onMouseDown={(event: any) => {
            console.log('clicked')
            // event.stopPropagation();
            // event.preventDefault();
            this.setState({ selected: true })
          }}
          onDragStop={(_, data) => {
            const boundingRect: LTWHP = {
              ...highlight.position.boundingRect,
              top: data.y,
              left: data.x,
            };

            onChange(boundingRect);
          }
        }
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
          {...otherProps}
        />
      </div>
    );
  }
}

export default AreaHighlight;
