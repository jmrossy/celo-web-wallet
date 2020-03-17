import * as React from "react";
import Header from "./header";

interface Props {
  name: string;
}

class App extends React.Component<Props> {
  render() {
    const { name } = this.props;
    return (
      <div>
        <h1 css={{ backgroundColor: "#029202" }}>Hello {name}</h1>
        <Header />
      </div>
    );
  }
}

export default App;
