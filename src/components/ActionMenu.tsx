import React, { Component } from "react"

interface State{
}

interface Props{
  status: string,
  handleAccept: () => void,
  handleReject: () => void,
  handleReview: () => void
}

export class ActionMenu extends Component<Props, State>{
  constructor(props: Props){
    super(props)
  }
  
  render() {
    return(
      <div className="Highlight__popup">
        <button 
          onClick={this.props.handleAccept}
          style={
            {
              display: this.props.status == "verified" ? "none" : "default"
            }
          }>
          Accept
        </button>
        <button 
          onClick={this.props.handleReview}
          style={
            {
              display: this.props.status == "pending" ? "none" : "default"
            }
          }
        >
          Review
        </button>
        <button 
          onClick={this.props.handleReject}
          style={
            {
              display: this.props.status == "rejected" ? "none" : "default"
            }
          }
        >
          Reject
        </button>
      </div>
    ) 
  }
}

export default ActionMenu