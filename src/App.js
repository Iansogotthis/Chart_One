import React, { useState, useEffect } from "react";
import Chart from "./components/Chart";
import Modal from "./components/Modal";
import FormModal from "./components/FormModal";
import "./App.css";

const App = () => {
  const [modalMode, setModalMode] = useState("none");
  const [label, setLabel] = useState("");
  const [currentSquare, setCurrentSquare] = useState("");
  const [formMode, setFormMode] = useState("");
  const [squares, setSquares] = useState([]);
  const [selectedSquare, setSelectedSquare] = useState(null);

  useEffect(() => {
    fetch("/squares")
      .then((response) => response.json())
      .then((data) => setSquares(data))
      .catch((error) => console.error("Error fetching squares:", error));
  }, []);

  const openModal = (square, mode) => {
    setCurrentSquare(square);
    setModalMode(mode);
  };

  const closeModal = () => {
    setModalMode("none");
    setLabel("");
  };

  const saveLabel = () => {
    // Logic to save the label
    closeModal();
  };

  const handleScaledView = () => {
    // Logic for scaled view
    closeModal();
  };

  const handleScopedView = () => {
    // Logic for scoped view
    closeModal();
  };

  const handleInclude = () => {
    setFormMode("include");
    setModalMode("form");
  };

  const handleExclude = () => {
    setFormMode("exclude");
    setModalMode("form");
  };

  const closeFormModal = () => {
    setModalMode("none");
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    const data = event.target.data.value;
    // Logic to handle form submission
    closeFormModal();
  };

  const handleSelectSquare = (square) => {
    setSelectedSquare(square);
    openModal(square, "modal");
  };

  return (
    <div className="App">
      <header className="App-header">
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
      <h1>Square Data Management App</h1>
      <ul>
        {squares.map((square) => (
          <li key={square.id} onClick={() => handleSelectSquare(square)}>
            {square.title}
          </li>
        ))}
      </ul>
      {selectedSquare && <Chart square={selectedSquare} />}
      <Modal
        isOpen={modalMode === "modal"}
        onClose={closeModal}
        onSave={saveLabel}
        label={label}
        setLabel={setLabel}
        onScaledView={handleScaledView}
        onScopedView={handleScopedView}
        onInclude={handleInclude}
      />
      <FormModal
        isOpen={modalMode === "form"}
        onClose={closeFormModal}
        onSubmit={handleFormSubmit}
        mode={formMode}
      />
    </div>
  );
};

export default App;
