# 🎓 HƯỚNG DẪN TRÌNH BÀY COMPONENT DIAGRAM - FOODFAST

## 📋 TỔNG QUAN HỆ THỐNG

### **Câu mở đầu:**

> "Hệ thống FOODFAST được thiết kế theo kiến trúc **Component-based Architecture**, gồm 4 subsystems chính: **Client_app** (giao diện khách hàng), **Server_app** (backend logic), **Admin_app** (quản lý drone), và **3rdServices** (dịch vụ bên ngoài). Các components giao tiếp với nhau thông qua **Ports** và **Interfaces** theo chuẩn UML."

---

## 🔷 PHẦN 1: CLIENT_APP (Frontend cho Customer)

### **A. Cấu trúc Component:**

**Khi trình bày, nói:**

> "**Client_app** là một **Composite Component** chứa 5 internal components xử lý các chức năng khác nhau trong quy trình đặt hàng."

### **B. Internal Components và Chức năng:**

#### **1. PaymentUI**
```
"Component này xử lý giao diện thanh toán"
```

**Dẫn chứng code:**
```javascript
// File: client_app/src/components/Checkout/PaymentSection.jsx
const PaymentSection = ({ order }) => {
  const handleVNPayPayment = async () => {
    // Gọi API tạo VNPay URL
    const response = await fetch('/api/payment/vnpay', {
      method: 'POST',
      body: JSON.stringify({ orderId: order._id, amount: order.total })
    });
    const { paymentUrl } = await response.json();
    window.location.href = paymentUrl; // Redirect đến VNPay
  };
  
  return (
    <button onClick={handleVNPayPayment}>Thanh toán VNPay</button>
  );
};
```

#### **2. CartManager**
```
"Quản lý giỏ hàng - thêm/xóa sản phẩm, tính tổng tiền"
```

**Dẫn chứng code:**
```javascript
// File: client_app/src/redux/slices/cartSlice.js
export const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], total: 0 },
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const existingItem = state.items.find(i => i._id === item._id);
      
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ ...item, quantity: 1 });
      }
      
      // Tính lại tổng tiền
      state.total = state.items.reduce((sum, i) => 
        sum + (i.price * i.quantity), 0
      );
    },
    
    removeFromCart: (state, action) => {
      state.items = state.items.filter(i => i._id !== action.payload);
      state.total = state.items.reduce((sum, i) => 
        sum + (i.price * i.quantity), 0
      );
    }
  }
});
```

#### **3. OrderForm**
```
"Form nhập thông tin giao hàng: địa chỉ, số điện thoại, tọa độ"
```

**Dẫn chứng code:**
```javascript
// File: client_app/src/pages/Checkout/CheckoutPage.jsx
const CheckoutPage = () => {
  const [deliveryInfo, setDeliveryInfo] = useState({
    customerName: '',
    customerPhone: '',
    deliveryAddress: '',
    coordinates: { lat: null, lng: null }
  });
  
  const validateForm = () => {
    // Validation
    if (!deliveryInfo.customerPhone.match(/^0\d{9}$/)) {
      toast.error('Số điện thoại không hợp lệ');
      return false;
    }
    
    if (!deliveryInfo.coordinates.lat) {
      toast.error('Vui lòng chọn địa chỉ trên bản đồ');
      return false;
    }
    
    return true;
  };
  
  return (
    <form>
      <input name="customerName" placeholder="Họ tên" />
      <input name="customerPhone" placeholder="Số điện thoại" />
      <textarea name="deliveryAddress" placeholder="Địa chỉ giao hàng" />
      <MapPicker onSelectLocation={setCoordinates} />
    </form>
  );
};
```

#### **4. Checkout**
```
"Component trung tâm kết hợp Cart + OrderForm → tạo đơn hàng"
```

**Dẫn chứng code:**
```javascript
// File: client_app/src/pages/Checkout/CheckoutPage.jsx
const handleCreateOrder = async () => {
  const orderData = {
    items: cartItems.map(item => ({
      product: item._id,
      quantity: item.quantity,
      price: item.price
    })),
    customerInfo: {
      name: deliveryInfo.customerName,
      phone: deliveryInfo.customerPhone
    },
    deliveryInfo: {
      address: deliveryInfo.deliveryAddress,
      coordinates: deliveryInfo.coordinates
    },
    restaurant: selectedRestaurant._id
  };
  
  // Gọi API tạo order
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  });
  
  const order = await response.json();
  
  // Chuyển sang trang thanh toán
  navigate(`/payment/${order._id}`);
};
```

#### **5. OrderTracker**
```
"Theo dõi trạng thái đơn hàng real-time qua Socket.io"
```

**Dẫn chứng code:**
```javascript
// File: client_app/src/pages/Order/OrderTracking.jsx
import { io } from 'socket.io-client';

const OrderTracking = ({ orderId }) => {
  const [orderStatus, setOrderStatus] = useState('pending');
  const [dronePosition, setDronePosition] = useState(null);
  
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL);
    
    // Join room để nhận updates cho order này
    socket.emit('join-order-room', orderId);
    
    // Lắng nghe events
    socket.on('order:status-changed', (data) => {
      setOrderStatus(data.status);
      toast.success(`Đơn hàng đã ${data.status}`);
    });
    
    socket.on('drone:position-update', (data) => {
      setDronePosition(data.position);
      // Update marker trên map
    });
    
    socket.on('order:delivered', () => {
      setOrderStatus('delivered');
      toast.success('Đơn hàng đã giao thành công!');
    });
    
    return () => socket.disconnect();
  }, [orderId]);
  
  return (
    <div>
      <StatusTimeline status={orderStatus} />
      <Map dronePosition={dronePosition} />
    </div>
  );
};
```

### **C. Ports & Interfaces:**

**Khi trình bày:**

> "Client_app có 3 **Provided Interfaces** (lollipop ○) bên trái - những gì app cung cấp cho user, và 3 **Required Interfaces** (socket ◐) bên phải - những gì app cần từ Server."

**Provided Interfaces (User interactions):**
- `IMakePayment` - User click "Thanh toán"
- `ICreateOrder` - User click "Đặt hàng"
- `ITrackOrder` - User xem tracking page

**Required Interfaces (Server dependencies):**
- `IOrderService` - Cần Server xử lý orders
- `IPaymentService` - Cần Server tạo VNPay URL
- `INotificationService` - Cần Socket.io để nhận updates

---

## 🔷 PHẦN 2: SERVER_APP (Backend Core Logic)

### **A. Cấu trúc Component:**

**Khi trình bày:**

> "**Server_app** là trung tâm xử lý logic, chứa 4 internal components: **OrderAPI**, **PaymentAPI**, **DroneAPI**, và **SocketService**. Các APIs này giao tiếp với nhau qua internal dependencies."

### **B. Internal Components và Chức năng:**

#### **1. OrderAPI**
```
"REST API xử lý đơn hàng - hub trung tâm"
```

**Dẫn chứng code:**
```javascript
// File: server_app/API/Controllers/orderController.js
exports.createOrder = async (req, res) => {
  try {
    const { items, customerInfo, deliveryInfo, restaurant } = req.body;
    
    // 1. Validate order
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Items không được rỗng' });
    }
    
    // 2. Calculate shipping fee (dựa vào khoảng cách)
    const restaurantDoc = await Restaurant.findById(restaurant);
    const distance = calculateDistance(
      restaurantDoc.location.coordinates,
      deliveryInfo.coordinates
    );
    const shippingFee = calculateShippingFee(distance);
    
    // 3. Calculate total
    const itemsTotal = items.reduce((sum, item) => 
      sum + (item.price * item.quantity), 0
    );
    
    // 4. Create order in database
    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      items,
      customerInfo,
      deliveryInfo,
      restaurant,
      itemsTotal,
      shippingFee,
      total: itemsTotal + shippingFee,
      status: 'pending'
    });
    
    // 5. Notify restaurant via Socket.io (gọi SocketService)
    const socketService = req.app.get('socketService');
    socketService.to(`restaurant-${restaurant}`).emit('order:created', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      items: order.items
    });
    
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

**Khi trình bày:**
> "OrderAPI có 3 dependencies chính: **Database** để lưu order, **SocketService** để notify real-time, và được gọi bởi **PaymentAPI** để update status sau khi thanh toán."

#### **2. PaymentAPI**
```
"Xử lý thanh toán VNPay - tạo URL, xử lý callback"
```

**Dẫn chứng code:**
```javascript
// File: server_app/API/Controllers/paymentController.js
exports.createVNPayPayment = async (req, res) => {
  try {
    const { orderId, bankCode } = req.body;
    
    // 1. Get order from OrderAPI/Database
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // 2. Create VNPay payment URL (via VNPayPort - IPaymentGateway)
    const vnpUrl = vnpay.buildPaymentUrl({
      vnp_Version: '2.1.0',
      vnp_TmnCode: process.env.VNP_TMN_CODE,
      vnp_Amount: order.total * 100, // VNPay yêu cầu * 100
      vnp_TxnRef: order.orderNumber,
      vnp_OrderInfo: `Thanh toan don hang ${order.orderNumber}`,
      vnp_ReturnUrl: `${process.env.CLIENT_URL}/payment/vnpay/return`,
      vnp_IpAddr: req.ip,
      vnp_BankCode: bankCode || ''
    });
    
    // 3. Save payment record to Database
    await Payment.create({
      order: orderId,
      amount: order.total,
      method: 'vnpay',
      status: 'pending',
      transactionRef: order.orderNumber
    });
    
    res.json({ success: true, paymentUrl: vnpUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.vnpayReturn = async (req, res) => {
  try {
    const vnpParams = req.query;
    
    // 1. Verify signature từ VNPay (IPaymentGateway)
    const secureHash = vnpParams.vnp_SecureHash;
    delete vnpParams.vnp_SecureHash;
    
    const signed = vnpay.sortObject(vnpParams);
    const signData = querystring.stringify(signed);
    const hmac = crypto.createHmac('sha512', process.env.VNP_HASH_SECRET);
    const checkSum = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    
    if (secureHash !== checkSum) {
      return res.status(400).json({ message: 'Invalid signature' });
    }
    
    // 2. Update payment status in Database
    await Payment.updateOne(
      { transactionRef: vnpParams.vnp_TxnRef },
      { 
        status: vnpParams.vnp_ResponseCode === '00' ? 'success' : 'failed',
        vnpTransactionNo: vnpParams.vnp_TransactionNo
      }
    );
    
    // 3. Update order status via OrderAPI
    const order = await Order.findOne({ orderNumber: vnpParams.vnp_TxnRef });
    if (vnpParams.vnp_ResponseCode === '00') {
      order.status = 'paid';
      order.paidAt = new Date();
      await order.save();
      
      // 4. Notify via SocketService
      const socketService = req.app.get('socketService');
      socketService.to(`restaurant-${order.restaurant}`).emit('payment:success', {
        orderId: order._id,
        orderNumber: order.orderNumber
      });
      socketService.to(`client-${order.customer}`).emit('payment:success', {
        orderId: order._id
      });
    }
    
    res.redirect(`${process.env.CLIENT_URL}/orders/${order._id}`);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

**Khi trình bày:**
> "PaymentAPI có 4 dependencies: **VNPay Gateway** để tạo payment URL, **Database** để lưu payment record, **OrderAPI** để update order status = 'paid', và **SocketService** để notify Client + Restaurant."

#### **3. DroneAPI**
```
"Quản lý drone - được gọi từ AdminApp"
```

**Dẫn chứng code:**
```javascript
// File: server_app/API/Controllers/adminController.js
exports.getPendingOrders = async (req, res) => {
  try {
    // Lấy orders đã thanh toán, đã confirmed, đã ready, nhưng chưa có drone
    const orders = await Order.find({
      status: 'ready',
      drone: null
    })
    .populate('restaurant', 'name address location')
    .populate('items.product', 'name')
    .sort('-createdAt');
    
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAvailableDrones = async (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    // Tìm drones: status = idle/available, battery > 20%
    const drones = await Drone.find({
      $or: [{ status: 'idle' }, { status: 'available' }],
      batteryLevel: { $gte: 20 }
    });
    
    // Nếu có tọa độ, tính khoảng cách và sort
    if (lat && lng) {
      const dronesWithDistance = drones.map(drone => {
        const distance = calculateDistance(
          drone.currentLocation.coordinates,
          [parseFloat(lng), parseFloat(lat)]
        );
        return { ...drone.toObject(), distance };
      });
      
      dronesWithDistance.sort((a, b) => a.distance - b.distance);
      return res.json({ success: true, data: dronesWithDistance });
    }
    
    res.json({ success: true, data: drones });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.assignDrone = async (req, res) => {
  try {
    const { orderId, droneId } = req.body;
    
    // 1. Validate
    const order = await Order.findById(orderId);
    const drone = await Drone.findById(droneId);
    
    if (!order || !drone) {
      return res.status(404).json({ message: 'Order or Drone not found' });
    }
    
    if (drone.status !== 'idle' && drone.status !== 'available') {
      return res.status(400).json({ 
        message: `Drone không available (status: ${drone.status})` 
      });
    }
    
    if (drone.batteryLevel < 20) {
      return res.status(400).json({ 
        message: 'Drone battery quá thấp' 
      });
    }
    
    // 2. Update order (OrderAPI dependency)
    order.drone = droneId;
    await order.save();
    
    // 3. Update drone (Database dependency)
    drone.status = 'busy';
    drone.currentOrder = orderId;
    await drone.save();
    
    // 4. Notify via SocketService
    const socketService = req.app.get('socketService');
    const populatedOrder = await Order.findById(orderId)
      .populate('drone', 'name model batteryLevel')
      .populate('restaurant', '_id name');
    
    socketService.to(`restaurant-${populatedOrder.restaurant._id}`)
      .emit('order:drone-assigned', {
        orderId: populatedOrder._id,
        orderNumber: populatedOrder.orderNumber,
        drone: populatedOrder.drone
      });
    
    res.json({ 
      success: true, 
      message: 'Drone assigned successfully',
      data: { order: populatedOrder, drone }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

**Khi trình bày:**
> "DroneAPI được gọi từ **AdminApp**, có 3 dependencies: **Database** để query drones, **OrderAPI** để update order.drone, và **SocketService** để notify Restaurant + Client."

#### **4. SocketService**
```
"Real-time notification hub - không phụ thuộc component nào"
```

**Dẫn chứng code:**
```javascript
// File: server_app/services/socketService.js
class SocketService {
  constructor(io) {
    this.io = io;
    this.setupEventHandlers();
  }
  
  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Socket connected: ${socket.id}`);
      
      // Client/Restaurant/Admin join rooms
      socket.on('join-restaurant-room', (restaurantId) => {
        socket.join(`restaurant-${restaurantId}`);
      });
      
      socket.on('join-client-room', (userId) => {
        socket.join(`client-${userId}`);
      });
      
      socket.on('join-order-room', (orderId) => {
        socket.join(`order-${orderId}`);
      });
      
      socket.on('disconnect', () => {
        console.log(`Socket disconnected: ${socket.id}`);
      });
    });
  }
  
  // Được gọi bởi OrderAPI, PaymentAPI, DroneAPI
  to(room) {
    return this.io.to(room);
  }
  
  emit(event, data) {
    this.io.emit(event, data);
  }
  
  emitToRoom(room, event, data) {
    this.io.to(room).emit(event, data);
  }
}

module.exports = SocketService;
```

**Khi trình bày:**
> "SocketService là **central notification hub**, được gọi bởi OrderAPI, PaymentAPI, DroneAPI nhưng **không phụ thuộc vào component nào** - đây là **independent service**."

---

## 🔷 PHẦN 3: ADMIN_APP (Drone Management)

### **A. Cấu trúc Component:**

**Khi trình bày:**

> "**Admin_app** chịu trách nhiệm quản lý drone fleet và phân công drone cho đơn hàng. App này kết nối với **Server_app.DroneAPI** qua **IDroneService interface**."

### **B. Internal Components:**

#### **1. OrderMonitor Dashboard**
```
"Hiển thị danh sách orders cần phân drone"
```

**Dẫn chứng code:**
```javascript
// File: admin_app/src/pages/Orders/PendingOrders.jsx
const PendingOrders = () => {
  const [orders, setOrders] = useState([]);
  
  useEffect(() => {
    // Gọi Server_app.DroneAPI.getPendingOrders()
    fetch('/api/admin/pending-orders')
      .then(res => res.json())
      .then(data => setOrders(data.data));
  }, []);
  
  return (
    <table>
      <thead>
        <tr>
          <th>Order Number</th>
          <th>Restaurant</th>
          <th>Customer</th>
          <th>Delivery Address</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {orders.map(order => (
          <tr key={order._id}>
            <td>{order.orderNumber}</td>
            <td>{order.restaurant.name}</td>
            <td>{order.customerInfo.name}</td>
            <td>{order.deliveryInfo.address}</td>
            <td><Badge>{order.status}</Badge></td>
            <td>
              <button onClick={() => openAssignModal(order)}>
                Assign Drone
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

#### **2. DroneFleet Dashboard**
```
"Hiển thị trạng thái đội drone real-time"
```

**Dẫn chứng code:**
```javascript
// File: admin_app/src/pages/Drones/DroneFleet.jsx
const DroneFleet = () => {
  const [drones, setDrones] = useState([]);
  
  useEffect(() => {
    // Gọi Server_app.DroneAPI.getAvailableDrones()
    const fetchDrones = async () => {
      const res = await fetch('/api/admin/drones');
      const data = await res.json();
      setDrones(data.data);
    };
    
    fetchDrones();
    
    // Real-time updates via Socket
    const socket = io();
    socket.on('drone:status-changed', (data) => {
      setDrones(prev => prev.map(d => 
        d._id === data.droneId ? { ...d, ...data } : d
      ));
    });
    
    return () => socket.disconnect();
  }, []);
  
  return (
    <div className="drone-grid">
      {drones.map(drone => (
        <DroneCard 
          key={drone._id}
          drone={drone}
          status={drone.status}
          battery={drone.batteryLevel}
          currentOrder={drone.currentOrder}
        />
      ))}
    </div>
  );
};
```

#### **3. DroneAssign Manager**
```
"UI để admin chọn drone cho order"
```

**Dẫn chứng code:**
```javascript
// File: admin_app/src/components/Modals/AssignDroneModal.jsx
const AssignDroneModal = ({ order, onClose }) => {
  const [availableDrones, setAvailableDrones] = useState([]);
  const [selectedDrone, setSelectedDrone] = useState(null);
  
  useEffect(() => {
    // Gọi Server_app.DroneAPI.getAvailableDrones(lat, lng)
    const fetchAvailableDrones = async () => {
      const { lat, lng } = order.deliveryInfo.coordinates;
      const res = await fetch(
        `/api/admin/available-drones?lat=${lat}&lng=${lng}`
      );
      const data = await res.json();
      setAvailableDrones(data.data);
    };
    
    fetchAvailableDrones();
  }, [order]);
  
  const handleAssign = async () => {
    // Gọi Server_app.DroneAPI.assignDrone(orderId, droneId)
    const res = await fetch('/api/admin/assign-drone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: order._id,
        droneId: selectedDrone._id
      })
    });
    
    if (res.ok) {
      toast.success('Drone assigned successfully!');
      onClose();
    }
  };
  
  return (
    <Modal>
      <h3>Assign Drone to Order {order.orderNumber}</h3>
      <div className="drone-list">
        {availableDrones.map(drone => (
          <div 
            key={drone._id}
            className={selectedDrone?._id === drone._id ? 'selected' : ''}
            onClick={() => setSelectedDrone(drone)}
          >
            <h4>{drone.name}</h4>
            <p>Battery: {drone.batteryLevel}%</p>
            <p>Distance: {drone.distance?.toFixed(2)} km</p>
          </div>
        ))}
      </div>
      <button onClick={handleAssign} disabled={!selectedDrone}>
        Assign Drone
      </button>
    </Modal>
  );
};
```

**Khi trình bày:**
> "Admin_app có **Required Interface IDroneService** kết nối với Server_app, gọi các methods: getPendingOrders(), getAvailableDrones(), assignDrone()."

---

## 🔷 PHẦN 4: 3RD_SERVICES (External Services)

### **A. Cấu trúc Component:**

**Khi trình bày:**

> "**3rdServices** chứa 2 external services: **VNPayGateway** và **MongoDB Atlas**. Các services này cung cấp **Provided Interfaces** cho Server_app nhưng **không có Required Interfaces** vì không phụ thuộc vào hệ thống FOODFAST."

### **B. Components:**

#### **1. VNPayGateway**
```
"Payment gateway bên ngoài - cung cấp IPaymentGateway interface"
```

**Dẫn chứng code:**
```javascript
// File: server_app/services/vnpayService.js
const crypto = require('crypto');
const querystring = require('qs');

class VNPayService {
  constructor() {
    this.vnpUrl = process.env.VNP_URL;
    this.tmnCode = process.env.VNP_TMN_CODE;
    this.secretKey = process.env.VNP_HASH_SECRET;
  }
  
  // Implement IPaymentGateway.createPaymentURL()
  buildPaymentUrl(params) {
    let vnpParams = { ...params };
    vnpParams['vnp_CreateDate'] = this.dateFormat(new Date());
    
    vnpParams = this.sortObject(vnpParams);
    
    const signData = querystring.stringify(vnpParams, { encode: false });
    const hmac = crypto.createHmac('sha512', this.secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    
    vnpParams['vnp_SecureHash'] = signed;
    
    return this.vnpUrl + '?' + querystring.stringify(vnpParams, { encode: false });
  }
  
  // Implement IPaymentGateway.verifyReturnURL()
  verifyReturnUrl(vnpParams) {
    const secureHash = vnpParams['vnp_SecureHash'];
    delete vnpParams['vnp_SecureHash'];
    
    const sortedParams = this.sortObject(vnpParams);
    const signData = querystring.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac('sha512', this.secretKey);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
    
    return secureHash === signed;
  }
  
  sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    keys.forEach(key => {
      sorted[key] = obj[key];
    });
    return sorted;
  }
  
  dateFormat(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const second = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}${hour}${minute}${second}`;
  }
}

module.exports = new VNPayService();
```

#### **2. MongoDB Atlas**
```
"Cloud database - cung cấp IDatabaseService interface"
```

**Dẫn chứng code:**
```javascript
// File: server_app/config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Kết nối MongoDB Atlas (IDatabaseService)
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

// Usage in server_app
// File: server_app/index.js
const connectDB = require('./config/database');

// Connect to MongoDB Atlas
connectDB();

// Các components dùng Mongoose models để tương tác với Database
// Ví dụ trong OrderAPI:
const Order = require('./API/Models/Order'); // Mongoose model

// IDatabaseService operations:
await Order.create(orderData);           // save()
await Order.findById(orderId);           // findById()
await Order.find({ status: 'ready' });   // find()
await Order.updateOne({ _id: id }, data); // update()
await Order.deleteOne({ _id: id });       // delete()
```

**Khi trình bày:**
> "MongoDB Atlas và VNPay Gateway chỉ có **Provided Interfaces** (lollipop ○), không có **Required Interfaces** (socket ◐) vì chúng là external services độc lập."

---

## 🎯 CÂU HỎI THƯỜNG GẶP & CÁCH TRẢ LỜI

### **Câu 1: "Giải thích flow khi user đặt hàng?"**

**Trả lời:**

> "Khi user đặt hàng, flow như sau:
> 
> 1. **Client_app.OrderForm** thu thập thông tin → gọi **Client_app.Checkout**
> 2. Checkout gọi API `/api/orders` → request đến **Server_app.ReceiveOrderPort**
> 3. Port **delegate** cho **OrderAPI.createOrder()**
> 4. OrderAPI validate, calculate shipping fee, save vào **MongoDB** (via **DatabasePort**)
> 5. OrderAPI gọi **SocketService.emit('order:created')** để notify Restaurant
> 6. Order được tạo với status = 'pending', return về Client
> 7. Client redirect sang **PaymentUI** để thanh toán
> 
> **Code minh chứng**: File `client_app/src/pages/Checkout/CheckoutPage.jsx` line 50-80 và `server_app/API/Controllers/orderController.js` line 10-60."

---

### **Câu 2: "Payment flow hoạt động như thế nào?"**

**Trả lời:**

> "Payment flow qua VNPay:
> 
> 1. **Client_app.PaymentUI** gọi API `/api/payment/vnpay` với orderId
> 2. **Server_app.PaymentAPI.createVNPayURL()** được gọi
> 3. PaymentAPI gọi **VNPayGateway.createPaymentURL()** (via **VNPayPort**)
> 4. VNPay service tạo URL với HMAC SHA512 signature
> 5. Client redirect đến VNPay → user nhập thẻ → VNPay callback về Server
> 6. **PaymentAPI.vnpayReturn()** verify signature
> 7. Nếu success: PaymentAPI gọi **OrderAPI.updateOrderStatus('paid')**
> 8. PaymentAPI gọi **SocketService** notify Client + Restaurant
> 9. Client nhận notification → hiển thị 'Thanh toán thành công'
> 
> **Code minh chứng**: Files `server_app/API/Controllers/paymentController.js` và `server_app/services/vnpayService.js`."

---

### **Câu 3: "Admin phân drone như thế nào?"**

**Trả lời:**

> "Drone assignment flow:
> 
> 1. **Admin_app.OrderMonitor** gọi `/api/admin/pending-orders`
> 2. **Server_app.DroneAPI.getPendingOrders()** return orders với status='ready', drone=null
> 3. Admin click 'Assign Drone' → **Admin_app.DroneAssignManager** mở modal
> 4. Modal gọi `/api/admin/available-drones?lat=10.8&lng=106.6`
> 5. **DroneAPI.getAvailableDrones()** query drones (status='idle', battery>20%), calculate distance, sort by distance
> 6. Admin chọn drone gần nhất → click 'Assign'
> 7. **DroneAPI.assignDrone()** được gọi:
>    - Update order.drone = droneId (via **OrderAPI**)
>    - Update drone.status = 'busy' (via **Database**)
>    - Emit 'drone:assigned' event (via **SocketService**)
> 8. Restaurant nhận notification → confirm handover → drone bắt đầu delivery
> 
> **Code minh chứng**: Files `admin_app/src/components/Modals/AssignDroneModal.jsx` và `server_app/API/Controllers/adminController.js` lines 100-180."

---

### **Câu 4: "Các components trong Server_app giao tiếp với nhau như thế nào?"**

**Trả lời:**

> "Có 3 loại giao tiếp trong Server_app:
> 
> **1. Direct dependency (OrderAPI ← PaymentAPI):**
> - PaymentAPI cần OrderAPI để update order status sau payment
> - Code: `await OrderAPI.updateOrderStatus(orderId, 'paid')`
> 
> **2. Central hub pattern (→ SocketService):**
> - OrderAPI, PaymentAPI, DroneAPI đều gọi SocketService để emit events
> - SocketService không gọi lại components nào (independent)
> - Code: `socketService.to('restaurant-123').emit('order:created', data)`
> 
> **3. External dependencies (→ DatabasePort, VNPayPort):**
> - Tất cả APIs cần Database để persist data
> - PaymentAPI cần VNPayPort để tạo payment URL
> - Code: `await Order.create(orderData)` và `vnpay.buildPaymentUrl(params)`
> 
> **Minh chứng**: Xem diagram - có 4 internal connectors (dashed arrows) từ các APIs → SocketService, và 5 delegation connectors từ các APIs → Ports (Database, VNPay)."

---

### **Câu 5: "Tại sao dùng Ports & Interfaces thay vì kết nối trực tiếp?"**

**Trả lời:**

> "Dùng Ports & Interfaces theo chuẩn UML Component Diagram có 3 lợi ích:
> 
> **1. Loose coupling (Liên kết lỏng):**
> - Client_app không biết Server_app implement như thế nào, chỉ biết interface IOrderService
> - Nếu đổi Server_app implementation (ví dụ từ Node.js sang Go), miễn sao vẫn implement IOrderService là Client vẫn hoạt động
> 
> **2. Testability (Dễ test):**
> - Có thể mock interfaces để test
> - Ví dụ: Test PaymentAPI bằng cách mock IPaymentGateway, không cần VNPay thật
> 
> **3. Clear contracts (Hợp đồng rõ ràng):**
> - Interface định nghĩa rõ methods, parameters, return types
> - Ví dụ: `IDroneService.assignDrone(orderId: String, droneId: String): Assignment`
> 
> **Trong code**: Mỗi Port được implement bằng Express Router, Delegation là route → controller."

---

### **Câu 6: "Real-time notification hoạt động như thế nào?"**

**Trả lời:**

> "Socket.io real-time notification:
> 
> **1. Setup connection:**
> - Client/Restaurant/Admin connect đến Socket.io server
> - Join vào rooms: `socket.join('restaurant-123')`, `socket.join('client-456')`
> - Code: `client_app/src/pages/Order/OrderTracking.jsx` line 15-20
> 
> **2. Server emit events:**
> - OrderAPI emit 'order:created' → to restaurant room
> - PaymentAPI emit 'payment:success' → to client + restaurant rooms
> - DroneAPI emit 'drone:assigned' → to restaurant + client rooms
> - Code: `socketService.to('restaurant-123').emit('order:created', data)`
> 
> **3. Client listen events:**
> - `socket.on('order:status-changed', callback)`
> - `socket.on('drone:position-update', callback)`
> - Update UI real-time khi nhận events
> 
> **4. Ưu điểm:**
> - Không cần polling (gọi API liên tục)
> - Latency thấp (<100ms)
> - Scalable với Socket.io Redis adapter
> 
> **Minh chứng**: File `server_app/services/socketService.js` và `client_app/src/pages/Order/OrderTracking.jsx`."

---

## 📊 BẢNG TÓM TẮT - SỬ DỤNG KHI TRÌNH BÀY

| Component | Internal Components | Provided Interfaces | Required Interfaces | Dependencies |
|-----------|-------------------|---------------------|---------------------|--------------|
| **Client_app** | PaymentUI, CartManager, OrderForm, Checkout, OrderTracker | IMakePayment, ICreateOrder, ITrackOrder | IOrderService, IPaymentService, INotificationService | Server_app |
| **Server_app** | OrderAPI, PaymentAPI, DroneAPI, SocketService | IOrderService, IPaymentService, IDroneService, INotificationService | IDatabaseService, IPaymentGateway | MongoDB, VNPay |
| **Admin_app** | OrderMonitor, DroneFleetDashboard, DroneAssignManager | IOrderView, IDroneManagement | IDroneService, INotificationService | Server_app |
| **3rdServices** | VNPayGateway, MongoDB Atlas | IPaymentGateway, IDatabaseService | (None - external) | (None) |

---

## 🔗 LUỒNG DỮ LIỆU HOÀN CHỈNH

### **Complete Order Flow (từ đầu đến cuối):**

```
1. Customer browses menu
   Client_app → GET /api/products → Server_app.ProductAPI → MongoDB
   
2. Customer adds to cart
   Client_app.CartManager (Redux local state)
   
3. Customer proceeds to checkout
   Client_app.Checkout → Client_app.OrderForm (enter delivery info)
   
4. Customer creates order
   Client_app → POST /api/orders → Server_app.OrderAPI
   → MongoDB (save order)
   → SocketService.emit('order:created') → Restaurant_app
   
5. Customer makes payment
   Client_app → POST /api/payment/vnpay → Server_app.PaymentAPI
   → VNPayGateway.buildPaymentUrl() → return paymentUrl
   → Client redirect to VNPay
   
6. VNPay callback after payment
   VNPay → GET /api/payment/vnpay/return → Server_app.PaymentAPI
   → verify signature
   → update Payment status in MongoDB
   → OrderAPI.updateOrderStatus('paid')
   → SocketService.emit('payment:success') → Client + Restaurant
   
7. Restaurant confirms order
   Restaurant_app → PATCH /api/orders/:id/status → Server_app.OrderAPI
   → update status = 'confirmed'
   → SocketService.emit('order:confirmed') → Client
   
8. Restaurant prepares food
   Restaurant_app → PATCH /api/orders/:id/status → Server_app.OrderAPI
   → update status = 'ready'
   → SocketService.emit('order:ready') → Admin_app
   
9. Admin assigns drone
   Admin_app → GET /api/admin/pending-orders → Server_app.DroneAPI
   Admin_app → GET /api/admin/available-drones?lat=&lng= → Server_app.DroneAPI
   Admin_app → POST /api/admin/assign-drone → Server_app.DroneAPI
   → update order.drone in MongoDB
   → update drone.status = 'busy' in MongoDB
   → SocketService.emit('drone:assigned') → Restaurant + Client
   
10. Restaurant confirms handover to drone
    Restaurant_app → PATCH /api/orders/:id/status → Server_app.OrderAPI
    → update status = 'picked_up'
    → DroneAPI.startDelivery() → update status = 'delivering'
    → DroneSimulation starts (background process)
    → SocketService.emit('delivery:started') → Client
    
11. Drone delivers (simulation)
    DroneSimulation → calculate position every 5s
    → SocketService.emit('drone:position-update', { lat, lng }) → Client
    → Client_app.OrderTracker updates map marker
    
12. Delivery complete
    DroneSimulation → when distance < 50m
    → OrderAPI.updateOrderStatus('delivered')
    → Drone.status = 'available'
    → SocketService.emit('order:delivered') → Client
    → Client_app shows success message
```

---

## 🎬 KẾT LUẬN - CÂU KẾT THÚC

**Khi kết thúc trình bày:**

> "Tóm lại, hệ thống FOODFAST được thiết kế theo **Component-based Architecture** với **clear separation of concerns**. **Client_app** xử lý UI, **Server_app** xử lý business logic, **Admin_app** quản lý drones, và **3rdServices** cung cấp external capabilities. Các components giao tiếp qua **Ports & Interfaces** đảm bảo **loose coupling** và **testability**. Real-time features được implement bằng **Socket.io** để enhance user experience. Source code minh chứng cho tất cả interactions đều có sẵn trong repository."

---

## 📝 TIPS KHI TRÌNH BÀY

### **1. Sử dụng Pointer/Laser:**
- Chỉ vào từng component khi nói về nó
- Trace theo mũi tên khi giải thích flow
- Highlight Ports và Interfaces quan trọng

### **2. Đi từ tổng quan → chi tiết:**
- Bước 1: Giới thiệu 4 subsystems
- Bước 2: Giải thích từng subsystem (internal components)
- Bước 3: Giải thích kết nối giữa subsystems (interfaces)
- Bước 4: Demo flow cụ thể (order flow, payment flow, drone assignment)

### **3. Sẵn sàng cho câu hỏi:**
- Mở sẵn các file code quan trọng trong VS Code
- Chuẩn bị demo live (nếu có)
- Có backup slides với screenshots code

### **4. Time management:**
- Tổng quan: 2 phút
- Client_app: 3 phút
- Server_app: 5 phút (quan trọng nhất)
- Admin_app: 2 phút
- 3rdServices: 1 phút
- Flow demos: 3 phút
- Q&A: 4 phút
- **Tổng: 20 phút**

### **5. Câu nói mở đầu mạnh mẽ:**
> "Chào mọi người, hôm nay tôi sẽ trình bày về **Component Diagram** của hệ thống FOODFAST - một food delivery system với drone delivery. Điểm đặc biệt của hệ thống là thiết kế theo **UML Component Architecture** chuẩn, với **Ports & Interfaces pattern** đảm bảo **loose coupling**, **high cohesion**, và **easy testability**."

### **6. Câu kết thúc ấn tượng:**
> "Hệ thống FOODFAST không chỉ là một ứng dụng đặt đồ ăn thông thường, mà là một **well-architected system** với real-time tracking, drone automation, và scalable design. Toàn bộ source code và documentation đều available trên GitHub. Cảm ơn mọi người đã lắng nghe. Nếu có câu hỏi, mời mọi người!"

---

## 🚀 CHECKLIST TRƯỚC KHI TRÌNH BÀY

- [ ] In diagram ra giấy A3 hoặc chuẩn bị slide rõ nét
- [ ] Mở sẵn các files code quan trọng trong VS Code
- [ ] Test demo (nếu có) - đảm bảo hoạt động
- [ ] Thuộc 6 câu hỏi thường gặp
- [ ] Chuẩn bị bảng tóm tắt (print hoặc slide)
- [ ] Kiểm tra thời gian trình bày (luyện tập 2-3 lần)
- [ ] Chuẩn bị backup plan nếu có technical issues
- [ ] Tự tin và nói chậm, rõ ràng

---

**Chúc bạn trình bày thành công! 🎯✨**
