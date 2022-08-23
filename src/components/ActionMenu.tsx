import React, { Component } from "react"

interface State{
}

interface Props{
  handleAccept: () => void,
  handleReject: () => void
}

export class ActionMenu extends Component<Props, State>{
  constructor(props: Props){
    super(props)
  }
  
  render() {
    return(
      <div className="Highlight__popup">
        <button onClick={this.props.handleAccept}>
          Accept
        </button>
        <button onClick={this.props.handleReject}>
          Reject
        </button>
      </div>
    ) 
  }
}

export default ActionMenu