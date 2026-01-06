/* ---------------- NODE CLASS ---------------- */
class Node {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
    this.height = 1;
    this.x = 0;
    this.y = 0;
  }
}

/* ---------------- GLOBAL VARIABLES ---------------- */
let root = null;
let searchedValue = null;
let searchPath = [];
let lastRotation = null;

/* ---------------- AVL FUNCTIONS ---------------- */
function height(node) { return node ? node.height : 0; }
function updateHeight(node) { node.height = Math.max(height(node.left), height(node.right)) + 1; }
function getBalance(node) { return node ? height(node.left) - height(node.right) : 0; }
function findNode(node, value) { 
  if (!node) return null; 
  if (node.value === value) return node; 
  return value < node.value ? findNode(node.left, value) : findNode(node.right, value); 
}

function rightRotate(y) {
  lastRotation = "Right Rotation (LL)";
  let x = y.left;
  let T2 = x.right;
  x.right = y;
  y.left = T2;
  updateHeight(y);
  updateHeight(x);
  return x;
}

function leftRotate(x) {
  lastRotation = "Left Rotation (RR)";
  let y = x.right;
  let T2 = y.left;
  y.left = x;
  x.right = T2;
  updateHeight(x);
  updateHeight(y);
  return y;
}

function insertNode(node, value) {
  if (!node) return new Node(value);
  if (value < node.value) node.left = insertNode(node.left, value);
  else if (value > node.value) node.right = insertNode(node.right, value);
  else return node;

  updateHeight(node);
  let balance = getBalance(node);

  if (balance > 1 && value < node.left.value) return rightRotate(node);
  if (balance < -1 && value > node.right.value) return leftRotate(node);
  if (balance > 1 && value > node.left.value) { node.left = leftRotate(node.left); lastRotation = "Left-Right Rotation (LR)"; return rightRotate(node); }
  if (balance < -1 && value < node.right.value) { node.right = rightRotate(node.right); lastRotation = "Right-Left Rotation (RL)"; return leftRotate(node); }

  return node;
}

function minValueNode(node) { 
  let current = node; 
  while (current.left) current = current.left; 
  return current; 
}

function deleteNode(node, value) {
  if (!node) return node;
  if (value < node.value) node.left = deleteNode(node.left, value);
  else if (value > node.value) node.right = deleteNode(node.right, value);
  else {
    if (!node.left || !node.right) node = node.left || node.right;
    else {
      let temp = minValueNode(node.right);
      node.value = temp.value;
      node.right = deleteNode(node.right, temp.value);
    }
  }

  if (!node) return node;

  updateHeight(node);
  let balance = getBalance(node);

  if (balance > 1 && getBalance(node.left) >= 0) return rightRotate(node);
  if (balance > 1 && getBalance(node.left) < 0) { node.left = leftRotate(node.left); lastRotation = "Left-Right Rotation (LR)"; return rightRotate(node); }
  if (balance < -1 && getBalance(node.right) <= 0) return leftRotate(node);
  if (balance < -1 && getBalance(node.right) > 0) { node.right = rightRotate(node.right); lastRotation = "Right-Left Rotation (RL)"; return leftRotate(node); }

  return node;
}

/* ---------------- SEARCH ---------------- */
function searchNodePath(node, value) {
  if (!node) return false;
  searchPath.push(node);
  if (node.value === value) return true;
  return value < node.value ? searchNodePath(node.left, value) : searchNodePath(node.right, value);
}

function searchValue() {
  const val = parseInt(document.getElementById("value").value);
  if (isNaN(val)) return;

  searchPath = [];
  if (searchNodePath(root, val)) {
    searchedValue = val;
    alert("Value found in AVL Tree");
  } else {
    searchedValue = null;
    alert("Value not found in AVL Tree");
  }

  drawTree();
}

/* ---------------- UI FUNCTIONS ---------------- */
function insertValue() {
  const val = parseInt(document.getElementById("value").value);
  if (isNaN(val)) return;

  lastRotation = null;
  root = insertNode(root, val);
  if (lastRotation) alert("Rotation Occurred: " + lastRotation);

  searchedValue = null;
  searchPath = [];
  drawTree();
}

function deleteValue() {
  const val = parseInt(document.getElementById("value").value);
  if (isNaN(val)) return;

  lastRotation = null;
  root = deleteNode(root, val);
  if (lastRotation) alert("Rotation Occurred: " + lastRotation);

  searchedValue = null;
  searchPath = [];
  drawTree();
}

function clearTree() {
  root = null;
  searchedValue = null;
  searchPath = [];
  lastRotation = null;
  const svg = document.getElementById("tree");
  svg.innerHTML = "";
}

/* ---------------- DRAW TREE ---------------- */
function drawTree() {
  const svg = document.getElementById("tree");
  svg.innerHTML = "";
  if (!root) return;

  let pos = { x: 0 };
  assignPositions(root, 0, pos);
  drawEdges(root, svg);
  drawNodes(root, svg);
}

function assignPositions(node, depth = 0, pos = { x: 0 }) {
  if (!node) return;
  assignPositions(node.left, depth + 1, pos);
  node.x = pos.x * 80 + 50;
  node.y = depth * 100 + 50;
  pos.x++;
  assignPositions(node.right, depth + 1, pos);
}

function drawEdges(node, svg) {
  if (!node) return;
  if (node.left) drawLine(node.x, node.y, node.left.x, node.left.y, svg);
  if (node.right) drawLine(node.x, node.y, node.right.x, node.right.y, svg);
  drawEdges(node.left, svg);
  drawEdges(node.right, svg);
}

function drawNodes(node, svg) {
  if (!node) return;
  drawCircle(node.x, node.y, node.value, svg);
  drawNodes(node.left, svg);
  drawNodes(node.right, svg);
}

function drawLine(x1, y1, x2, y2, svg) {
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", x1);
  line.setAttribute("y1", y1);
  line.setAttribute("x2", x2);
  line.setAttribute("y2", y2);
  line.setAttribute("stroke", "#94a3b8");
  line.setAttribute("stroke-width", "2");
  svg.appendChild(line);
}

function drawCircle(x, y, value, svg) {
  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("cx", x);
  circle.setAttribute("cy", y);
  circle.setAttribute("r", 22);

  const bf = getBalance(findNode(root, value));

  // Fill color based on BF
  let fillColor = "#38bdf8";
  if (bf === 0) fillColor = "#4ade80";
  else if (bf === 1 || bf === -1) fillColor = "#facc15";
  else fillColor = "#f87171";
  circle.setAttribute("fill", fillColor);

  // Outline for search path / searched node
  if (value === searchedValue) circle.setAttribute("stroke", "#f43f5e");
  else if (searchPath.some(n => n.value === value)) circle.setAttribute("stroke", "#fcd34d");
  else circle.setAttribute("stroke", "#0f172a");
  circle.setAttribute("stroke-width", "4");

  svg.appendChild(circle);

  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("x", x);
  text.setAttribute("y", y + 5);
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("fill", "#0f172a");
  text.setAttribute("font-weight", "bold");
  text.textContent = value;
  svg.appendChild(text);

  const bfText = document.createElementNS("http://www.w3.org/2000/svg", "text");
  bfText.setAttribute("x", x);
  bfText.setAttribute("y", y + 35);
  bfText.setAttribute("text-anchor", "middle");
  bfText.setAttribute("fill", "#94a3b8");
  bfText.setAttribute("font-size", "12");
  bfText.textContent = `BF=${bf}`;
  svg.appendChild(bfText);
}

/* ---------------- EXPOSE FUNCTIONS TO HTML ---------------- */
window.insertValue = insertValue;
window.deleteValue = deleteValue;
window.searchValue = searchValue;
window.clearTree = clearTree;
