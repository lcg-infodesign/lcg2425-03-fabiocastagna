let table, maxLength, selectedRiver = null, sortedDischarges = [];

const LAYOUT = {
  margin: 80,
  titleMargin: 40,
  padding: 20,
  borderRadius: 4,
  pointSize: 12,
  lineHeight: 24
};

const COLORS = {
  primary: '#424242',
  primaryLight: '#616161',
  accent: '#FF4081',
  background: '#FAFAFA',
  surface: '#FFFFFF',
  onSurface: '#212121',
  gridLines: '#E0E0E0'
};

function preload() { table = loadTable('Rivers in the world - Data.csv', 'csv', 'header'); }

function setup() {
  createCanvas(windowWidth, windowHeight);
  maxLength = table.getRows().reduce((max, row) => Math.max(max, row.getNum('length')), 0);
  sortedDischarges = table.getRows().map(row => row.getNum('discharge')).sort((a, b) => a - b);
  noLoop();
}

function draw() {
  background(COLORS.background);
  drawGrid();
  drawAxis();
  drawAllPoints();
  selectedRiver !== null && drawInfoBox(selectedRiver);
  drawTitle();
}

function drawGrid() {
  stroke(COLORS.gridLines);
  strokeWeight(1);
  for (let i = LAYOUT.margin; i <= width - LAYOUT.margin; i += (width - 2 * LAYOUT.margin) / 10) {
    line(i, LAYOUT.margin, i, height - LAYOUT.margin);
  }
  for (let i = LAYOUT.margin; i <= height - LAYOUT.margin; i += (height - 2 * LAYOUT.margin) / 10) {
    line(LAYOUT.margin, i, width - LAYOUT.margin, i);
  }
}

function drawTitle() {
  fill(COLORS.onSurface);
  noStroke();
  textAlign(CENTER, TOP);
  textSize(24);
  text('Rivers in the world', width/2, LAYOUT.titleMargin);
}

function drawAxis() {
  stroke(COLORS.onSurface);
  strokeWeight(2);
  line(LAYOUT.margin, height - LAYOUT.margin, width - LAYOUT.margin, height - LAYOUT.margin);
  line(LAYOUT.margin, height - LAYOUT.margin, LAYOUT.margin, LAYOUT.margin);
  
  fill(COLORS.onSurface);
  noStroke();
  textAlign(CENTER);
  textSize(14);
  text('Length (km)', width/2, height - LAYOUT.margin/2);
  
  push();
  translate(LAYOUT.margin/2, height/2);
  rotate(-PI/2);
  text('Discharge (m³/s)', 0, 0);
  pop();
}

function drawAllPoints() {
  table.getRows().forEach((row, i) => {
    const x = map(row.getNum('length'), 0, maxLength, LAYOUT.margin, width - LAYOUT.margin);
    const y = map(sortedDischarges.indexOf(row.getNum('discharge')), 0, sortedDischarges.length - 1, height - LAYOUT.margin, LAYOUT.margin);
    
    if (selectedRiver === i) {
      noFill();
      stroke(COLORS.primaryLight);
      strokeWeight(2);
      circle(x, y, LAYOUT.pointSize * 2.5);
      fill(COLORS.accent);
      noStroke();
      circle(x, y, LAYOUT.pointSize * 1.2);
    } else {
      fill(COLORS.primary);
      noStroke();
      circle(x, y, LAYOUT.pointSize);
    }
  });
}

function drawInfoBox(index) {
  const row = table.getRow(index);
  const x = map(row.getNum('length'), 0, maxLength, LAYOUT.margin, width - LAYOUT.margin);
  const y = map(sortedDischarges.indexOf(row.getNum('discharge')), 0, sortedDischarges.length - 1, height - LAYOUT.margin, LAYOUT.margin);
  
  const content = [
    { text: row.getString('name'), size: 14, color: COLORS.onSurface },
    { text: 'Length: ' + nfc(row.getNum('length')) + ' km', size: 12, color: COLORS.onSurface + '99' },
    { text: 'Discharge: ' + nfc(row.getNum('discharge')) + ' m³/s', size: 12, color: COLORS.onSurface + '99' },
    { text: 'Country: ' + row.getString('countries').split(',')[0].trim(), size: 12, color: COLORS.onSurface + '99' }
  ];
  
  const boxWidth = content.reduce((max, item) => {
    textSize(item.size);
    return Math.max(max, textWidth(item.text));
  }, 0) + LAYOUT.padding * 2;
  
  const boxHeight = LAYOUT.lineHeight * content.length + LAYOUT.padding * 2;
  const boxX = Math.max(LAYOUT.margin, (x + boxWidth + 10 > width - LAYOUT.margin) ? x - boxWidth - 10 : x + 10);
  const boxY = (y - boxHeight - 10 < LAYOUT.margin) ? y + 10 : y - boxHeight - 10;
  
  drawingContext.shadowOffsetX = 0;
  drawingContext.shadowOffsetY = 2;
  drawingContext.shadowBlur = 4;
  drawingContext.shadowColor = 'rgba(0, 0, 0, 0.2)';
  
  fill(COLORS.surface);
  noStroke();
  rect(boxX, boxY, boxWidth, boxHeight, LAYOUT.borderRadius);
  drawingContext.shadowColor = 'rgba(0, 0, 0, 0)';
  
  textAlign(CENTER, CENTER);
  content.forEach((item, i) => {
    textSize(item.size);
    fill(item.color);
    text(item.text, boxX + boxWidth/2, boxY + LAYOUT.padding + LAYOUT.lineHeight * (i + 0.5));
  });
}

function mouseMoved() {
  selectedRiver = null;
  table.getRows().forEach((row, i) => {
    const x = map(row.getNum('length'), 0, maxLength, LAYOUT.margin, width - LAYOUT.margin);
    const y = map(sortedDischarges.indexOf(row.getNum('discharge')), 0, sortedDischarges.length - 1, height - LAYOUT.margin, LAYOUT.margin);
    if (dist(mouseX, mouseY, x, y) < LAYOUT.pointSize && !selectedRiver) {
      selectedRiver = i;
      cursor(HAND);
    }
  });
  !selectedRiver && cursor(ARROW);
  redraw();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  redraw();
}
