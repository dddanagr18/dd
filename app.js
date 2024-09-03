document.addEventListener('DOMContentLoaded', () => {
  const barcodeInput = document.getElementById('barcodeInput');
  const tableBody = document.querySelector('#barcodeTable tbody');
  const downloadBtn = document.getElementById('downloadBtn');
  const historyBtn = document.getElementById('historyBtn');
  const barcodeCountDisplay = document.getElementById('barcodeCount');
  const maxBarcodes = 2000;
  let barcodeData = loadDataFromLocalStorage(); // Load existing data from local storage

  // Update barcode count display
  function updateBarcodeCount() {
    const count = barcodeData.flat().length; // Count total barcodes across all sales orders
    barcodeCountDisplay.textContent = `Total Barcodes: ${count}`;
  }

  barcodeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && barcodeData.flat().length < maxBarcodes) {
      e.preventDefault();
      const date = document.getElementById('date').value;
      const salesOrder = document.getElementById('salesOrder').value;
      const barcode = barcodeInput.value.trim();

      if (barcode && date && salesOrder) {
        if (isDuplicateBarcode(salesOrder, barcode)) {
          alert("Duplicate barcode detected. It will not be added.");
        } else {
          addBarcodeData(date, salesOrder, barcode);
          addBarcodeToTable(date, salesOrder, barcode);
          updateBarcodeCount();
          barcodeInput.value = ''; // Clear the input
        }
      } else {
        alert("Please fill in all fields and scan a valid barcode.");
      }
    }
  });

  function addBarcodeData(date, salesOrder, barcode) {
    if (!barcodeData[salesOrder]) {
      barcodeData[salesOrder] = [];
    }
    barcodeData[salesOrder].push({ date, barcode });
    saveDataToLocalStorage();
  }

  function isDuplicateBarcode(salesOrder, barcode) {
    return barcodeData[salesOrder] && barcodeData[salesOrder].some(item => item.barcode === barcode);
  }

  function addBarcodeToTable(date, salesOrder, barcode) {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${date}</td><td>${salesOrder}</td><td>${barcode}</td>`;
    tableBody.appendChild(row);
  }

  downloadBtn.addEventListener('click', () => {
    const salesOrder = document.getElementById('salesOrder').value;
    if (salesOrder && barcodeData[salesOrder]) {
      downloadExcelFile(salesOrder);
    } else {
      alert("No data available for the selected Sales Order.");
    }
  });

  function downloadExcelFile(salesOrder) {
    let csvContent = "data:text/csv;charset=utf-8,Date,Barcode\n";
    barcodeData[salesOrder].forEach(row => {
      csvContent += `${row.date},${row.barcode}\n`; // No single quote before barcode
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${salesOrder}_barcodes.csv`);
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
  }

  function saveDataToLocalStorage() {
    localStorage.setItem('barcodeData', JSON.stringify(barcodeData));
  }

  function loadDataFromLocalStorage() {
    const savedData = localStorage.getItem('barcodeData');
    return savedData ? JSON.parse(savedData) : {};
  }

  historyBtn.addEventListener('click', () => {
    const salesOrder = document.getElementById('salesOrder').value;
    if (salesOrder && barcodeData[salesOrder]) {
      displayHistory(salesOrder);
    } else {
      alert("No history available for the selected Sales Order.");
    }
  });

  function displayHistory(salesOrder) {
    tableBody.innerHTML = ''; // Clear current table data
    barcodeData[salesOrder].forEach(item => {
      addBarcodeToTable(item.date, salesOrder, item.barcode);
    });
  }

  // Initial update of barcode count on page load
  updateBarcodeCount();
});
