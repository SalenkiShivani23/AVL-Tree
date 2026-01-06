document.addEventListener("DOMContentLoaded", () => {

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

let root = null;
let searchedValue = null;
let searchPath = [];
let lastRotation = null;
const svg = document.getElementById("tree");

/* ---------------- AVL UTILS ---------------- */
function height(node) { return node ? node.height : 0; }
function updateHeight(node) { node.height = Math.max(height(node.left), height(node.right)) + 1; }
function getBalance(node) { return node ? height(node.left) - height(node.right) : 0; }
function findNode(node, value) {
  if (!node) return null;
  if (node.value === value) return node;
  if (value < node.value) return findNode(node.left, value);
  return findNode(node.right, value);
}

/* ---------------- ROTATIONS ---------------- */
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

/* ---------------- INSERT ---------------- */
function insertNode(node, value) {
  if (!node) return new Node(value);

  if (value < node.value)
    node.left = insertNode(node.left, value);
  else if (value > node.value)
    node.right = insertNode(node.right, value);
  else
    return node;

  updateHeight(node);
  let balance = getBalance(node);

  if (balance > 1 && value < node.left.value)
    return rightRotate(node);
  if (balance < -1 && value > node.right.value)
    return leftRotate(node);
  if (balance > 1 && value > node.left.value) {
    node.left = leftRotate(node.left);
    lastRotation = "Left-Right Rotation (LR)";
    return rightRotate(node);
  }
  if (balance < -1 && value < node.right.value) {
    node.right = rightRotate(node.right);
    lastRotation = "Right-Left Rotation (RL)";
    return leftRotate(node);
  }

  return node;
}

/* ---------------- DELETE ---------------- */
function minValueNode(node) {
  let current = node;
  while (current.left) current = current.left;
  return current;
}

function deleteNode(root, value) {
  if (!root) return root;

  if (value < root.value) root.left = deleteNode(root.left, value);
  else if (value > root.value) root.right = deleteNode(root.right, value);
  else {
    if (!root.left || !root.right) root = root.left || root.right;
    else {
      let temp = minValueNode(root.right);
      root.value = temp.value;
      root.right = deleteNode(root.right, temp.value);
    }
  }

  if (!root) return root;

  updateHeight(root);
  let balance = getBalance(root);

  if (balance > 1 && getBalance(root.left) >= 0)
    return rightRotate(root);
  if (balance > 1 && getBalance(root.left) < 0) {
    root.left = leftRotate(root.left);
    lastRotation = "Left-Right Rotation (LR)";
    return rightRotate(root);
  }
  if (balance < -1 && getBalance(root.right) <= 0)
    return leftRotate(root);
  if (balance < -1 && getBalance(root.right) > 0) {
    root.right = rightRotate(root.right);
    lastRotation = "Right-Left Rotation (RL)";
    return leftRotate(root);
  }

  return root;
}

/* ---------------- SEARCH ---------------- */
function searchNodePath(node, value) {
  if (!node) return false;
  searchPath.push(node);
  if (node.value === value) return true;
  if (value < node.value) return searchNodePath(node.left, value);
  return searchNodePath(node.right, value);
}

function searchValue() {
  let val = parseInt(document.getElementById("value").value);
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
  let val = parseInt(document.getElementById("value").value);
  if (isNaN(val)) return;

  lastRotation = null;
  root = insertNode(root, val);
  if (lastRotation) alert("Rotation Occurred: " + lastRotation);

  // Reset search highlights after insertion
  searchedValue = null;
  searchPath = [];

  drawTree();
}

function deleteValue() {
  let val = parseInt(document.getElementById("value").value);
  if (isNaN(val)) return;

  lastRotation = null;
  root = deleteNode(root, val);
  if (lastRotation) alert("Rotation Occurred: " + lastRotation);

  // Reset search highlights after deletion
  searchedValue = null;
  searchPath = [];

  drawTree();
}

function clearTree() {
  root = null;
  searchedValue = null;
  searchPath = [];
  lastRotation = null;
  svg.innerHTML = "";
}

/* ---------------- DRAW TREE ---------------- */
function drawTree() {
  svg.innerHTML = "";
  if (!root) return;

  let pos = { x: 0 }; // horizontal counter for in-order
  assignPositions(root, 0, pos);
  drawEdges(root);
  drawNodes(root);
}

// In-order positioning to prevent overlap
function assignPositions(node, depth = 0, pos = { x: 0 }) {
  if (!node) return;

  assignPositions(node.left, depth + 1, pos);

  node.x = pos.x * 80 + 50; // horizontal spacing
  node.y = depth * 100 + 50; // vertical spacing
  pos.x++;

  assignPositions(node.right, depth + 1, pos);
}

function drawEdges(node) {
  if (!node) return;
  if (node.left) drawLine(node.x, node.y, node.left.x, node.left.y);
  if (node.right) drawLine(node.x, node.y, node.right.x, node.right.y);
  drawEdges(node.left);
  drawEdges(node.right);
}

function drawNodes(node) {
  if (!node) return;
  drawCircle(node.x, node.y, node.value);
  drawNodes(node.left);
  drawNodes(node.right);
}

function drawLine(x1, y1, x2, y2) {
  let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", x1);
  line.setAttribute("y1", y1);
  line.setAttribute("x2", x2);
  line.setAttribute("y2", y2);
  line.setAttribute("stroke", "#94a3b8");
  line.setAttribute("stroke-width", "2");
  svg.appendChild(line);
}

function drawCircle(x, y, value) {
  let circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("cx", x);
  circle.setAttribute("cy", y);
  circle.setAttribute("r", 22);

  let bf = getBalance(findNode(root, value));

  // Fill color based on BF
  let fillColor = "#38bdf8"; // default
  if (bf === 0) fillColor = "#4ade80";
  else if (bf === 1 || bf === -1) fillColor = "#facc15";
  else fillColor = "#f87171";
  circle.setAttribute("fill", fillColor);

  // Outline for search path / searched node
  if (value === searchedValue) {
    circle.setAttribute("stroke", "#f43f5e");
    circle.setAttribute("stroke-width", "4");
  } else if (searchPath.some(n => n.value === value)) {
    circle.setAttribute("stroke", "#fcd34d");
    circle.setAttribute("stroke-width", "4");
  } else {
    circle.setAttribute("stroke", "#0f172a");
    circle.setAttribute("stroke-width", "2");
  }

  // Node value text
  let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("x", x);
  text.setAttribute("y", y + 5);
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("fill", "#0f172a");
  text.setAttribute("font-weight", "bold");
  text.textContent = value;

  // Balance Factor text
  let bfText = document.createElementNS("http://www.w3.org/2000/svg", "text");
  bfText.setAttribute("x", x);
  bfText.setAttribute("y", y + 35);
  bfText.setAttribute("text-anchor", "middle");
  bfText.setAttribute("fill", "#94a3b8");
  bfText.setAttribute("font-size", "12");
  bfText.textContent = `BF=${bf}`;

  svg.appendChild(circle);
  svg.appendChild(text);
  svg.appendChild(bfText);
}
// Expose functions for HTML buttons
window.insertValue = insertValue;
window.deleteValue = deleteValue;
window.searchValue = searchValue;
window.clearTree = clearTree;



