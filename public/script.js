(function () {
  // script.js
  let squareData = {}; // This will be populated with data from the server

  const svg = d3
    .select("#chart")
    .append("svg")
    .attr("width", "100%")
    .attr("height", 500)
    .attr("viewBox", `0 0 ${window.innerWidth * 0.9} ${window.innerHeight * 0.9}`)
    .attr("preserveAspectRatio", "xMidYMid meet");

  const modal = document.getElementById("myModal");
  const modalText = document.getElementById("modal-text");
  const btnClose = document.getElementsByClassName("close")[0];
  const btnSaveLabel = document.getElementById("save-label");
  const btnViewScale = document.getElementById("view-scale");
  const btnViewScope = document.getElementById("view-scope");
  const btnInclude = document.getElementById("include");
  const btnCancel = document.getElementById("cancel");
  const labelInput = document.getElementById("label-input");
  let currentSquare = null;
  
  btnClose.onclick = () => {
    modal.style.display = "none";
  };
  btnCancel.onclick = () => {
    modal.style.display = "none";
  };
  window.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  };

  // Utility Functions
  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  function getColor(className) {
    const colors = {
      root: "lightblue",
      branch: "lightgray",
      leaf: "lightgreen",
      fruit: "lightcoral"
    };
    return colors[className] || "lightgrey";
  }

  function filterSquares(data, className) {
    const filterRecursive = (data) => {
      if (data.class === className) return data;
      if (data.children) {
        data.children = data.children.map(filterRecursive).filter(Boolean);
        return data.children.length ? data : null;
      }
      return null;
    };
    return filterRecursive(data);
  }

  // Main Visualization Functions
  function drawSquare(svg, square, x, y, size, color, depth) {
    if (!square || !square.class) {
      console.error("Invalid square data:", square);
      return;
    }

    const iconClass = {
      root: "fa-home",
      branch: "fa-tree",
      leaf: "fa-leaf",
      fruit: "fa-apple-alt"
    };

    svg
      .append("rect")
      .attr("x", x)
      .attr("y", y)
      .attr("width", size)
      .attr("height", size)
      .attr("fill", color)
      .attr("opacity", square.included ? 1 : 0.3)
      .attr("rx", 4)
      .attr("ry", 4)
      .on("click", () => {
        currentSquare = square;
        openModal(square);
      });

    svg
      .append("text")
      .attr("x", x + size / 4)
      .attr("y", y + size / 2 + 5)
      .attr("font-family", "Font Awesome 5 Free")
      .attr("class", `fa ${iconClass[square.class]}`)
      .attr("font-size", "24px")
      .attr("fill", "#333");

    if (square.children) {
      const childSize = size / 2;
      const childSpacing = size / 3;
      let childX = x + size / 2 - (square.children.length * (childSize + childSpacing)) / 2;
      let childY = y + size + childSpacing;

      for (const child of square.children) {
        drawSquare(
          svg,
          child,
          childX,
          childY,
          childSize,
          getColor(child.class),
          depth + 1
        );
        childX += childSize + childSpacing;
      }
    }
  }

  function initializeVisualization(data) {
    if (!data || !data.class) {
      console.error("Invalid root data:", data);
      return;
    }

    const centerX = window.innerWidth * 0.45;
    const centerY = window.innerHeight * 0.45;
    const centerSquareSize = Math.min(window.innerWidth, window.innerHeight) / 2;
    drawSquare(
      svg,
      data,
      centerX,
      centerY,
      centerSquareSize,
      getColor(data.class),
      data.depth
    );
  }

  // Modal Functions
  function openModal(square) {
    modal.style.display = "flex";
    labelInput.value = square.title;
    modalText.textContent = `Edit Square: ${square.title}`;
  }

  btnSaveLabel.onclick = async () => {
    if (currentSquare) {
      currentSquare.title = labelInput.value;
      try {
        const response = await fetch(`/squares/${currentSquare.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(currentSquare)
        });
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();
        console.log("Success:", data);
        closeModal();
        const fetchResponse = await fetch("/squares");
        const fetchData = await fetchResponse.json();
        svg.selectAll("*").remove(); // Clear previous svg
        initializeVisualization(fetchData);
      } catch (error) {
        console.error("Error:", error);
      }
    }
    modal.style.display = "none";
  };

  btnViewScope.onclick = () => {
    const selectedClass = prompt("Enter class to filter (e.g., leaf, fruit):");
    const filteredData = filterSquares(squareData, selectedClass);
    svg.selectAll("*").remove(); // Clear previous svg
    initializeVisualization(filteredData);
  };

  btnViewScale.onclick = () => {
    const zoomScale = 2;
    const svg = d3.select("svg");
    const translateX = svg.attr("width") / 2;
    const translateY = svg.attr("height") / 2;
    svg
      .transition()
      .duration(300)
      .attr(
        "transform",
        `translate(${translateX}, ${translateY}) scale(${zoomScale})`
      );
  };

  btnInclude.onclick = () => {
    currentSquare.included = !currentSquare.included;
    initializeVisualization(squareData); // Re-render the visualization
  };

  // Load and Save Data
  async function loadData() {
    try {
      const response = await fetch('http://localhost:3000/squares'); // Update with correct backend endpoint
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();

      if (!data || data.length === 0) {
        console.error("No data received from the server.");
        return;
      }

      squareData = data[0]; // Assuming the first object is the root square
      console.log("Data loaded:", squareData);

      initializeVisualization(squareData); // Initialize visualization with the fetched data
    } catch (error) {
      console.error('Error fetching data:', error);
      squareData = {}; // Fallback to empty data if fetch fails
    }
  }

  function saveData() {
    if (squareData) {
      localStorage.setItem("squareData", JSON.stringify(squareData));
    } else {
      console.error("No data to save");
    }
  }

  window.addEventListener("beforeunload", saveData);
  window.addEventListener("load", loadData);

  // Adjust fruit opacity on leaf hover
  function adjustFruitOpacityOnLeafHover() {
    const leafSquares = document.querySelectorAll(".leaf");
    const fruitSquares = document.querySelectorAll(".fruit");

    leafSquares.forEach((leaf) => {
      leaf.addEventListener("mouseover", () => {
        fruitSquares.forEach((fruit) => {
          fruit.style.opacity = "1";
        });
      });
      leaf.addEventListener("mouseout", () => {
        fruitSquares.forEach((fruit) => {
          fruit.style.opacity = "0.3";
        });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", adjustFruitOpacityOnLeafHover);
})();
