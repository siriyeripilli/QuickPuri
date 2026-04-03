function login(role) {
    window.location.href = role === "student" ? "student.html" : "seller.html";
}

/* ======================
   STUDENT: PLACE ORDER
====================== */
function placeOrder() {
    let items = document.querySelectorAll(".item");
    let stop = document.getElementById("stop").value.trim();

    if (stop === "") {
        alert("Enter bus stop");
        return;
    }

    let prices = {
        "Pani Puri": 30,
        "Masala Puri": 40,
        "Dahi Puri": 50,
        "Amaravathi": 35,
        "Muri Mixture": 20,
        "Chat": 25
    };

    let selectedItems = [];
    let total = 0;

    items.forEach(div => {
        let checkbox = div.querySelector("input[type='checkbox']");
        let qtyInput = div.querySelector("input[type='number']");

        if (checkbox.checked) {
            let name = checkbox.value;
            let qty = parseInt(qtyInput.value);
            let price = prices[name] * qty;

            total += price;
            selectedItems.push({ name, qty, price });
        }
    });

    if (selectedItems.length === 0) {
        alert("Select at least one item");
        return;
    }

    let orders = JSON.parse(localStorage.getItem("orders")) || [];

    let now = new Date();
    let today = now.toLocaleDateString();

    // 🔁 Reset order numbers daily
    let lastDate = localStorage.getItem("orderDate");
    let orderNo = 1;

    if (lastDate === today) {
        orderNo = orders.length + 1;
    } else {
        orders = []; // clear old orders
        localStorage.setItem("orderDate", today);
    }

    let newOrder = {
        id: Date.now(),
        orderNo: orderNo,
        items: selectedItems,
        busStop: stop,
        total: total,
        date: today,
        time: now.toLocaleTimeString(),
        status: "Preparing"
    };

    orders.push(newOrder); // FIFO maintained
    localStorage.setItem("orders", JSON.stringify(orders));

    document.getElementById("msg").innerText =
        `Order #${orderNo} placed successfully! Total ₹${total}`;
}

/* ======================
   SELLER: LOAD ORDERS
====================== */
function loadOrder() {
    let orders = JSON.parse(localStorage.getItem("orders")) || [];
    let container = document.getElementById("orderDetails");

    if (orders.length === 0) {
        container.innerHTML = "No orders yet";
        return;
    }

    // Group orders by bus stop
    let grouped = {};
    orders.forEach(order => {
        if (!grouped[order.busStop]) {
            grouped[order.busStop] = [];
        }
        grouped[order.busStop].push(order);
    });

    let html = "";

    for (let stop in grouped) {
        html += `
        <div class="bus-stop">📍 Bus Stop: ${stop}</div>

        <table class="order-table">
            <tr>
                <th>Order #</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
            </tr>
        `;

        grouped[stop].forEach(order => {
            html += `
            <tr>
                <td>${order.orderNo}</td>
                <td>
                    ${order.items.map(i => `${i.name} x ${i.qty}`).join("<br>")}
                </td>
                <td>₹${order.total}</td>
                <td>${order.status}</td>
                <td>
                    <button onclick="markReady(${order.id})">Ready</button>
                    <button onclick="completeOrder(${order.id})">Done</button>
                </td>
            </tr>
            `;
        });

        html += `</table><br>`;
    }

    container.innerHTML = html;
}

/* ======================
   SELLER: MARK READY
====================== */
function markReady(id) {
    let orders = JSON.parse(localStorage.getItem("orders"));
    orders.forEach(order => {
        if (order.id === id) {
            order.status = "Ready";
        }
    });
    localStorage.setItem("orders", JSON.stringify(orders));
    loadOrder();
}

/* ======================
   SELLER: COMPLETE ORDER
====================== */
function completeOrder(id) {
    let orders = JSON.parse(localStorage.getItem("orders"));
    orders = orders.filter(order => order.id !== id);
    localStorage.setItem("orders", JSON.stringify(orders));
    loadOrder();
}
