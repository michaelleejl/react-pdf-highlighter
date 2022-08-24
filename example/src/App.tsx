import React, { Component, createRef } from "react";

import {
  PdfLoader,
  PdfHighlighter,
  Tip,
  Highlight,
  Popup,
  AreaHighlight,
  ActionMenu
} from "./react-pdf-highlighter";

import type { IHighlight, NewHighlight } from "./react-pdf-highlighter";

import { testHighlights as _testHighlights } from "./test-highlights";
import { Spinner } from "./Spinner";
import { Sidebar } from "./Sidebar";

import "./style/App.css";
import { EventBus } from "pdfjs-dist/types/web/ui_utils";

const testHighlights: Record<string, Array<IHighlight>> = _testHighlights;

interface State {
  url: string;
  highlights: Array<IHighlight>;
}

const updateHash = (highlight: IHighlight) => {
  document.location.hash = `highlight-${highlight.id}`;
};

const getNextId = () => String(Math.random()).slice(2);

const parseIdFromHash = () =>
  document.location.hash.slice("#highlight-".length);

const resetHash = () => {
  document.location.hash = "";
};

const PRIMARY_PDF_URL = "https://arxiv.org/pdf/1708.08021.pdf";
const SECONDARY_PDF_URL = "https://arxiv.org/pdf/1604.02480.pdf";

const searchParams = new URLSearchParams(document.location.search);

const initialUrl = searchParams.get("url") || PRIMARY_PDF_URL;

const sortHighlights = (h1:IHighlight, h2:IHighlight) => {
  if (h1.position.pageNumber != h2.position.pageNumber){
    return h1.position.pageNumber - h2.position.pageNumber
  } else {
    if (h1.position.boundingRect.y1 != h2.position.boundingRect.y1){
      return h1.position.boundingRect.y1 - h2.position.boundingRect.y1
     } else {
       return h1.position.boundingRect.x1 - h2.position.boundingRect.x1
     }
  }
   
}

const nextPendingHighlight = (highlight: IHighlight, highlights:IHighlight[]) => {
  highlights.filter(h => h.comment.status == "pending").sort(sortHighlights)
  const l = highlights.length
  if (l > 1){
    let b = highlights.findIndex(h => h.id === highlight.id)
    let nextHighlight = highlights[(b + 1) % l]
    let nextID = nextHighlight.id
    // if (refs[nextID]){
    //   let r = refs[nextID]
    //   r.current.focus()
    // }
    updateHash(highlights[(b + 1) % l])
  }
  
}

class App extends Component<{}, State> {
  constructor(props: {} | Readonly<{}>){
    super(props)
    this.state = {
      url: initialUrl,
      highlights: (testHighlights[initialUrl]
        ? [...testHighlights[initialUrl]]
        : []).sort(sortHighlights),
    };
    
  }

  resetHighlights = () => {
    this.setState({
      highlights: [],
    });
  };

  toggleDocument = () => {
    const newUrl =
      this.state.url === PRIMARY_PDF_URL ? SECONDARY_PDF_URL : PRIMARY_PDF_URL;

    this.setState({
      url: newUrl,
      highlights: testHighlights[newUrl] ? [...testHighlights[newUrl]] : [],
    });
  };

  scrollViewerTo = (highlight: any) => {};

  scrollToHighlightFromHash = () => {
    const highlight = this.getHighlightById(parseIdFromHash());

    if (highlight) {
      this.scrollViewerTo(highlight);
    }
  };

  componentDidMount() {
    window.addEventListener(
      "hashchange",
      this.scrollToHighlightFromHash,
      false
    );
  }

  getHighlightById(id: string) {
    const { highlights } = this.state;

    return highlights.find((highlight) => highlight.id === id);
  }

  addHighlight(highlight: NewHighlight) {
    const { highlights } = this.state;

    const id = getNextId()
    this.setState({
      highlights: [{ ...highlight, id }, ...highlights].sort(sortHighlights),
    });
  }

  updateHighlight(highlightId: string, position: Object, content: Object, comment:Object) {
    console.log("Updating highlight", highlightId, position, content);
    this.setState({
      highlights: this.state.highlights.map((h) => {
        const {
          id,
          position: originalPosition,
          content: originalContent,
          comment: originalComment,
          ...rest
        } = h;
        return id === highlightId
          ? {
              id,
              position: { ...originalPosition, ...position },
              content: { ...originalContent, ...content },
              comment: {...originalComment, ...comment},
              ...rest
            }
          : h;
      })
      .sort(sortHighlights),
    });
  }

  render() {
    const { url, highlights } = this.state;

    return (
      <div className="App" style={{ display: "flex", height: "100vh" }}>
        <div
          style={{
            height: "100vh",
            width: "75vw",
            position: "relative",
            background: "#303034"
          }}
        >
          <PdfLoader url={url} beforeLoad={<Spinner />}>
            {(pdfDocument) => (
              <PdfHighlighter
                pdfDocument={pdfDocument}
                enableAreaSelection={(event) => true}
                onScrollChange={resetHash}
                // pdfScaleValue="page-width"
                scrollRef={(scrollTo) => {
                  this.scrollViewerTo = scrollTo;

                  this.scrollToHighlightFromHash();
                }}
                onSelectionFinished={(
                  position,
                  content,
                  hideTipAndSelection,
                  transformSelection
                ) => (
                  <Tip
                    onOpen={transformSelection}
                    onConfirm={(comment) => {
                      this.addHighlight({ content, position, comment:{...comment, status:"verified"} });

                      hideTipAndSelection();
                    }}
                  />
                )}
                highlightTransform={(
                  highlight,
                  index,
                  setTip,
                  hideTip,
                  viewportToScaled,
                  screenshot,
                  isScrolledTo
                ) => {
                  const isTextHighlight = !Boolean(
                    highlight.content && highlight.content.image
                  );

                  return (
                    <Popup
                      popupContent={<ActionMenu 
                                      status = {highlight.comment.status}
                                      handleAccept={() => {this.updateHighlight(highlight.id, {}, highlight.content, { status:"verified" }); }}
                                      handleReject={() => this.updateHighlight(highlight.id, {}, highlight.content, { status:"rejected" })}
                                      handleReview={() => this.updateHighlight(highlight.id, {}, highlight.content, { status:"pending" })}
                                     />}
                                      
                      onMouseOver={(popupContent) =>
                        setTip(highlight, (highlight) => popupContent)
                      }
                      onMouseOut={hideTip}
                      key={index}
                    >
                      {isTextHighlight ? (
                    <Highlight
                      isScrolledTo={isScrolledTo}
                      position={highlight.position}
                      comment={highlight.comment}
                    />
                  ) : (
                    <AreaHighlight
                      isScrolledTo={isScrolledTo}
                      highlight={highlight}
                      onEnter={() => nextPendingHighlight(highlight, this.state.highlights)}
                      onChange={(boundingRect) => {
                        this.updateHighlight(
                          highlight.id,
                          { boundingRect: viewportToScaled(boundingRect) },
                          { image: screenshot(boundingRect) },
                          highlight.comment
                        );
                      }}
                    />
                  )}
                      </Popup>
                  );
                }}
                highlights={highlights}
              />
            )}
          </PdfLoader>
        </div>
        <Sidebar
          highlights={highlights}
          resetHighlights={this.resetHighlights}
          toggleDocument={this.toggleDocument}
        />
      </div>
    );
  }
}

export default App;
