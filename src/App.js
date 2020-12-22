import logo from "./logo.svg";
import "./App.css";
import CardViewer from "./components/CardViewer";

const cardData = {
  front: "What does padding refer to in CSS?",
  back:
    "Padding refers to the space between the border of the element and the content of the element",
  user_id: 1,
  public: true,
  active: true,
  notes: [
    "if border-box sizing is used padding will not effect the size of an element",
    "padding 'pads the content'",
  ],
};

function App() {
  const card = cardData;

  return (
    <div>
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
        </header>
      </div>
      <div className="container">
        <p>
          <CardViewer card={card} />
        </p>
      </div>
    </div>
  );
}

export default App;
