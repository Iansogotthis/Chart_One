document.addEventListener('DOMContentLoaded', () => {
  // Set SVG dimensions and center points
  const svg = d3.select("#chart");
  const width = window.innerWidth * 0.9;
  const height = window.innerHeight * 0.9;
  const centerX = width / 2;
  const centerY = height / 2;
  const centerSquareSize = Math.min(width, height) / 2;
  const smallSquareSize = centerSquareSize / 2;
  const smallestSquareSize = smallSquareSize / 2;
  const tinySquareSize = smallestSquareSize / 2;

  svg.attr("viewBox", `0 0 ${width} ${height}`).attr("preserveAspectRatio", "xMidYMid meet");

  // Modal elements
  const modal = document.getElementById("myModal");
  const btnClose = document.getElementsByClassName("close")[0];
  const btnViewScale = document.getElementById("view-scale");
  const btnViewScope = document.getElementById("view-scope");
  const btnInclude = document.getElementById("include");
  const btnCancel = document.getElementById("cancel");

  // Variables for current modal state
  let currentSquareData = null;

  // Function to open the modal
  function openModal(squareData) {
    currentSquareData = squareData;
    modal.style.display = "flex";
    renderFormModal(true, 'include', currentSquareData);
  }

  // Event listener to close modal when the close button is clicked
  btnClose.onclick = function () {
    modal.style.display = "none";
    renderFormModal(false);
  };

  // Event listener to close modal when clicking outside of the modal
  window.onclick = function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
      renderFormModal(false);
    }
  };

  // Event listener for the "Include" button
  btnInclude.onclick = function () {
    const squareData = {
      title: 'Sample Title',
      plane: 'Sample Plane',
      purpose: 'Sample Purpose',
      delineator: 'Sample Delineator',
      notations: 'Sample Notations',
      details: 'Sample Details',
      extraData: 'Sample Extra Data',
      name: 'Sample Name',
      size: 'Sample Size',
      color: 'Sample Color',
      type: 'Sample Type',
      parent_id: 'Sample Parent ID'
    };
    openModal(squareData);
  };

  // Function to render the FormModal component
  function renderFormModal(isOpen, mode = '', squareData = null) {
    ReactDOM.render(
      <FormModal isOpen={isOpen} onClose={() => { modal.style.display = "none"; renderFormModal(false); }} mode={mode} squareData={squareData} />,
      document.getElementById('modal-root')
    );
  }
});