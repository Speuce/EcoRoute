// Function to build the graph from the routes data
function buildGraph(routes) {
    const graph = {};
    routes.forEach(route => {
        const { from, to, co2 } = route;
        if (!graph[from]) {
            graph[from] = [];
        }
        graph[from].push({ node: to, co2 });
        // Assuming the routes are bidirectional
        if (!graph[to]) {
            graph[to] = [];
        }
        graph[to].push({ node: from, co2 });
    });
    return graph;
}

// Dijkstra's algorithm to find the lowest CO₂ route
function findLowestCO2Route(graph, start, end) {
    const distances = {};
    const prev = {};
    const pq = new MinPriorityQueue();

    Object.keys(graph).forEach(node => {
        distances[node] = Infinity;
    });
    distances[start] = 0;

    pq.enqueue(start, 0);

    while (!pq.isEmpty()) {
        const { element: currentNode } = pq.dequeue();

        if (currentNode === end) {
            break;
        }

        graph[currentNode].forEach(neighbor => {
            const alt = distances[currentNode] + neighbor.co2;
            if (alt < distances[neighbor.node]) {
                distances[neighbor.node] = alt;
                prev[neighbor.node] = currentNode;
                pq.enqueue(neighbor.node, alt);
            }
        });
    }

    // Reconstruct the path
    const path = [];
    let u = end;
    if (prev[u] || u === start) {
        while (u) {
            path.unshift(u);
            u = prev[u];
        }
    }

    return { path, totalCO2: distances[end] };
}

// Priority Queue implementation
class MinPriorityQueue {
    constructor() {
        this.heap = [];
    }

    enqueue(element, priority) {
        this.heap.push({ element, priority });
        this.sort();
    }

    dequeue() {
        return this.heap.shift();
    }

    isEmpty() {
        return this.heap.length === 0;
    }

    sort() {
        this.heap.sort((a, b) => a.priority - b.priority);
    }
}
function setDropdownOptions(){
    // all of the airports in the routes
    const airports = [...new Set(window.routes.flatMap(route => [route.from, route.to]))];
    const fromDropdown = document.getElementById('from');
    const toDropdown = document.getElementById('to');

    airports.forEach(airport => {
        const option = document.createElement('option');
        option.value = airport;
        option.text = airport;
        fromDropdown.add(option);
        toDropdown.add(option.cloneNode(true));
    });
}

function onSearch(graph){
    const from = document.getElementById('from').value.toUpperCase();
    const to = document.getElementById('to').value.toUpperCase();

    if (!graph[from] || !graph[to]) {
        alert('Invalid airport code(s). Please try again.');
        return;
    }

    const { path, totalCO2 } = findLowestCO2Route(graph, from, to);

    if (path.length === 0) {
        alert('No route found between the specified airports.');
        return;
    }

    document.getElementById('route').innerText = `Route: ${path.join(' ➔ ')}`;
    document.getElementById('emissions').innerText = `Total CO₂ Emissions: ${totalCO2} kg`;
    document.getElementById('result-container').style.display = 'block';
}

// Main function to handle the search
function main() {
    const routesData = window.routes;
    setDropdownOptions();

    const graph = buildGraph(routesData);
    document.getElementById('searchBtn').addEventListener('click', () => {
        onSearch(graph);
    });
}

main();
