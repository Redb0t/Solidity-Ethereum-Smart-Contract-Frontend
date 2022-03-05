import React from 'react';
export default class Input extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: ''};
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    // console.log(this.props);
    this.props.onChange(event.target.value);
    this.setState({value: event.target.value});
    // this.props.setMessage(event.target.value);
  }

  render() {
    return (
      <form>
        <div className="bio">
        <label>
          Enter a message:
          <input type="text" value={this.state.value} onChange={this.handleChange} />
          </label>
        </div>
      </form>
    );
  }
}