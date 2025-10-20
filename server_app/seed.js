// server_app/seed.js
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('./API/Models/User');
const Restaurant = require('./API/Models/Restaurant');
const Product = require('./API/Models/Product');
const Category = require('./API/Models/Category');
const Drone = require('./API/Models/Drone');
const Voucher = require('./API/Models/Voucher');
const Promotion = require('./API/Models/Promotion');
const Review = require('./API/Models/Review');
const Order = require('./API/Models/Order');

const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb://127.0.0.1:27017/foodfast'; // Fallback nếu không dùng .env

mongoose.set('strictQuery', true);

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected for seeding...');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    // Xoá dữ liệu cũ
    await Promise.all([
      User.deleteMany({}),
      Restaurant.deleteMany({}),
      Product.deleteMany({}),
      Category.deleteMany({}),
      Drone.deleteMany({}),
      Voucher.deleteMany({}),
      Promotion.deleteMany({}),
      Review.deleteMany({}),
      Order.deleteMany({}),
    ]);
    console.log('Cleared existing data...');

    // Tạo Users (User model sẽ tự động hash password qua pre-save hook)
    // Tạo admin, user, drone operator trước
    const initialUsers = await User.create([
      {
        name: 'Admin User',
        email: 'admin@foodfast.com',
        password: 'admin123',
        role: 'admin',
        phone: '0901234567',
        address: '123 Admin St, HCM City',
      },
      {
        name: 'John Doe',
        email: 'user@foodfast.com',
        password: 'user123',
        role: 'user',
        phone: '0901234568',
        address: '456 User St, HCM City',
        location: {
          type: 'Point',
          coordinates: [106.6297, 10.8231],
        },
      },
      {
        name: 'Drone Operator',
        email: 'drone@foodfast.com',
        password: 'drone123',
        role: 'drone_operator',
        phone: '0901234570',
        address: '101 Drone Rd, HCM City',
      },
      {
        name: 'Drone Manager',
        email: 'dronemanager@example.com',
        password: '123456',
        role: 'drone_operator',
        phone: '0901234571',
        address: '102 Drone Management Center, HCM City',
      },
    ]);
    console.log('Initial users created:', initialUsers.length);

    // Categories
    const categories = await Category.create([
      { name: 'Cơm', description: 'Các món cơm', image: 'http://localhost:5000/uploads/com.jpg' },
      { name: 'Phở', description: 'Các món phở', image: 'hhttp://localhost:5000/uploads/pho.jpg' },
      { name: 'Bún', description: 'Các món bún', image: 'http://localhost:5000/uploads/bun.jpg' },
      { name: 'Đồ uống', description: 'Nước giải khát', image: 'http://localhost:5000/uploads/nuocgiakhat.jpg' },
      { name: 'Fastfood', description: 'Đồ ăn nhanh', image: 'http://localhost:5000/uploads/doannhanh.jpg' },
    ]);
    console.log('Categories created:', categories.length);

    // Tạo 3 Restaurant Owner users - mỗi người quản lý 1 nhà hàng
    const restaurantOwner1 = await User.create({
      name: 'Chủ Cơm Tấm Sài Gòn',
      email: 'restaurant@foodfast.com',
      password: 'restaurant123',
      role: 'restaurant',
      phone: '0901234569',
      address: '123 Nguyen Hue, District 1, HCM City',
    });

    const restaurantOwner2 = await User.create({
      name: 'Chủ Phở Hà Nội',
      email: 'pho@foodfast.com',
      password: 'restaurant123',
      role: 'restaurant',
      phone: '0901234570',
      address: '456 Le Loi, District 1, HCM City',
    });

    const restaurantOwner3 = await User.create({
      name: 'Chủ KFC HCM',
      email: 'kfc@foodfast.com',
      password: 'restaurant123',
      role: 'restaurant',
      phone: '0901234571',
      address: '789 Tran Hung Dao, District 5, HCM City',
    });
    console.log('Restaurant owners created: 3');

    // Restaurants - Mỗi restaurant có 1 owner riêng
    const restaurants = await Restaurant.create([
      {
        name: 'Cơm Tấm Sài Gòn',
        description: 'Cơm tấm ngon nhất Sài Gòn',
        image: 'http://localhost:5000/uploads/comtam.jpg',
        rating: 4.5,
        reviewCount: 125,
        address: '123 Nguyen Hue, District 1, HCM City',
        phone: '0281234567',
        email: 'comtam@restaurant.com',
        categories: ['Việt Nam', 'Cơm'],
        location: {
          type: 'Point',
          coordinates: [106.7006, 10.7756],
        },
        openingHours: '07:00 - 22:00',
        owner: restaurantOwner1._id,
        promo: {
          text: 'Giảm 15% cho đơn hàng đầu tiên',
          discountPercent: 15,
          minOrder: 50000,
          validUntil: new Date('2025-12-31'),
        },
      },
      {
        name: 'Phở Hà Nội',
        description: 'Phở bò Hà Nội chính gốc',
        image: 'http://localhost:5000/uploads/pho.jpg',
        rating: 4.7,
        reviewCount: 89,
        address: '456 Le Loi, District 1, HCM City',
        phone: '0281234568',
        email: 'pho@restaurant.com',
        categories: ['Việt Nam', 'Phở'],
        location: {
          type: 'Point',
          coordinates: [106.6947, 10.7731],
        },
        openingHours: '06:00 - 21:00',
        owner: restaurantOwner2._id,
        promo: {
          text: 'Mua 2 tặng 1 cho tô phở đặc biệt',
          discountPercent: 20,
          validUntil: new Date('2025-11-30'),
        },
      },
      {
        name: 'KFC HCM',
        description: 'Gà rán KFC',
        image: 'http://localhost:5000/uploads/KFC.jpg',
        rating: 4.3,
        reviewCount: 234,
        address: '789 Tran Hung Dao, District 5, HCM City',
        phone: '0281234569',
        email: 'kfc@restaurant.com',
        categories: ['Fastfood', 'Gà rán'],
        location: {
          type: 'Point',
          coordinates: [106.6811, 10.7543],
        },
        openingHours: '08:00 - 23:00',
        owner: restaurantOwner3._id,
        promo: 'Combo gà rán giá sốc - Chỉ 99k',
      },
    ]);
    console.log('Restaurants created:', restaurants.length);

    // Cập nhật restaurantId cho từng restaurant owner
    await User.findByIdAndUpdate(restaurantOwner1._id, {
      restaurantId: restaurants[0]._id, // Cơm Tấm Sài Gòn
    });
    await User.findByIdAndUpdate(restaurantOwner2._id, {
      restaurantId: restaurants[1]._id, // Phở Hà Nội
    });
    await User.findByIdAndUpdate(restaurantOwner3._id, {
      restaurantId: restaurants[2]._id, // KFC HCM
    });
    console.log('Updated all restaurant owners with their restaurantId');

    // Verify
    const verified1 = await User.findById(restaurantOwner1._id);
    const verified2 = await User.findById(restaurantOwner2._id);
    const verified3 = await User.findById(restaurantOwner3._id);
    console.log('✓ Owner 1 (restaurant@foodfast.com) manages:', restaurants[0].name);
    console.log('✓ Owner 2 (pho@foodfast.com) manages:', restaurants[1].name);
    console.log('✓ Owner 3 (kfc@foodfast.com) manages:', restaurants[2].name);

    // Products
    const products = await Product.create([
      {
        name: 'Cơm Tấm Sườn Bì Chả',
        description: 'Cơm tấm với sườn nướng, bì và chả trứng',
        price: 45000,
        image: 'http://localhost:5000/uploads/comtam.jpg',
        category: categories[0]._id,
        restaurant: restaurants[0]._id,
        stock: 100,
        rating: 4.6,
        totalReviews: 45,
      },
      {
        name: 'Cơm Tấm Sườn Nướng',
        description: 'Cơm tấm với sườn nướng thơm lừng',
        price: 35000,
        image: 'http://localhost:5000/uploads/comtamsuonbicha.jpg',
        category: categories[0]._id,
        restaurant: restaurants[0]._id,
        stock: 100,
        rating: 4.5,
        totalReviews: 32,
      },
      {
        name: 'Phở Bò Tái',
        description: 'Phở bò với thịt tái mềm',
        price: 50000,
        image: 'http://localhost:5000/uploads/pho.jpg',
        category: categories[1]._id,
        restaurant: restaurants[1]._id,
        stock: 80,
        rating: 4.8,
        totalReviews: 67,
      },
      {
        name: 'Phở Bò Chín',
        description: 'Phở bò với thịt chín',
        price: 55000,
        image: 'http://localhost:5000/uploads/pho.jpg',
        category: categories[1]._id,
        restaurant: restaurants[1]._id,
        stock: 80,
        rating: 4.7,
        totalReviews: 54,
      },
      {
        name: 'Gà Rán 2 Miếng',
        description: '2 miếng gà rán giòn tan',
        price: 65000,
        image: 'http://localhost:5000/uploads/garan.jpg',
        category: categories[4]._id,
        restaurant: restaurants[2]._id,
        stock: 150,
        rating: 4.4,
        totalReviews: 89,
      },
      {
        name: 'Combo Gà + Burger',
        description: 'Combo gà rán, burger và coca',
        price: 95000,
        image: 'http://localhost:5000/uploads/garanburger.jpg',
        category: categories[4]._id,
        restaurant: restaurants[2]._id,
        stock: 120,
        rating: 4.5,
        totalReviews: 123,
      },
      {
        name: 'Trà Đá',
        description: 'Trà đá mát lạnh',
        price: 5000,
        image: 'http://localhost:5000/uploads/trada.jpg',
        category: categories[3]._id,
        restaurant: restaurants[0]._id,
        stock: 200, 
        rating: 4.0,
        totalReviews: 12,
      },
    ]);
    console.log('Products created:', products.length);

    // Drones
    const drones = await Drone.create([
      {
        name: 'Drone Alpha',
        serialNumber: 'DRONE-001',
        model: 'DJI Mavic 3',
        status: 'available',
        batteryLevel: 100,
        maxWeight: 5,
        currentLocation: { type: 'Point', coordinates: [106.6947, 10.7731] },
        homeLocation: { type: 'Point', coordinates: [106.6947, 10.7731] },
      },
      {
        name: 'Drone Beta',
        serialNumber: 'DRONE-002',
        model: 'DJI Mini 3 Pro',
        status: 'available',
        batteryLevel: 85,
        maxWeight: 3,
        currentLocation: { type: 'Point', coordinates: [106.7006, 10.7756] },
        homeLocation: { type: 'Point', coordinates: [106.7006, 10.7756] },
      },
      {
        name: 'Drone Gamma',
        serialNumber: 'DRONE-003',
        model: 'DJI Air 2S',
        status: 'charging',
        batteryLevel: 25,
        maxWeight: 4,
        currentLocation: { type: 'Point', coordinates: [106.6811, 10.7543] },
        homeLocation: { type: 'Point', coordinates: [106.6811, 10.7543] },
      },
    ]);
    console.log('Drones created:', drones.length);

    // Vouchers - Tạo voucher cho từng nhà hàng
    const vouchers = await Voucher.create([
      {
        code: 'COMTAM50',
        name: 'Giảm 50K cho Cơm Tấm',
        description: 'Áp dụng cho đơn hàng từ 100K',
        restaurant: restaurants[0]._id,
        discountType: 'fixed',
        discountValue: 50000,
        minOrder: 100000,
        maxUsage: 100,
        validFrom: new Date('2025-01-01'),
        validUntil: new Date('2025-12-31'),
        isActive: true,
        userRestriction: 'all',
      },
      {
        code: 'PHO20OFF',
        name: 'Giảm 20% cho Phở',
        description: 'Giảm tối đa 30K',
        restaurant: restaurants[1]._id,
        discountType: 'percentage',
        discountValue: 20,
        maxDiscount: 30000,
        minOrder: 50000,
        maxUsage: 50,
        validFrom: new Date('2025-01-01'),
        validUntil: new Date('2025-12-31'),
        isActive: true,
        userRestriction: 'all',
      },
      {
        code: 'KFCNEW',
        name: 'Voucher cho khách hàng mới',
        description: 'Giảm 15% cho khách hàng mới',
        restaurant: restaurants[2]._id,
        discountType: 'percentage',
        discountValue: 15,
        maxDiscount: 50000,
        minOrder: 80000,
        maxUsage: 200,
        validFrom: new Date('2025-01-01'),
        validUntil: new Date('2025-12-31'),
        isActive: true,
        userRestriction: 'new',
      },
      {
        code: 'FREESHIP',
        name: 'Miễn phí giao hàng',
        description: 'Miễn phí ship cho đơn từ 50K',
        restaurant: restaurants[0]._id,
        discountType: 'fixed',
        discountValue: 15000,
        minOrder: 50000,
        maxUsage: null, // Không giới hạn
        validFrom: new Date('2025-01-01'),
        validUntil: new Date('2025-12-31'),
        isActive: true,
        userRestriction: 'all',
      },
    ]);
    console.log('Vouchers created:', vouchers.length);

    // Promotions - Khuyến mãi theo danh mục sản phẩm
    const promotions = await Promotion.create([
      {
        restaurant: restaurants[0]._id,
        name: 'Giảm giá món Cơm',
        description: 'Giảm 10% cho tất cả món cơm',
        discountPercent: 10,
        category: categories[0]._id, // Cơm
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        isActive: true,
      },
      {
        restaurant: restaurants[1]._id,
        name: 'Khuyến mãi Phở',
        description: 'Giảm 15% cho tất cả món phở',
        discountPercent: 15,
        category: categories[1]._id, // Phở
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-11-30'),
        isActive: true,
      },
      {
        restaurant: restaurants[2]._id,
        name: 'Sale Fastfood',
        description: 'Giảm 20% cho đồ ăn nhanh',
        discountPercent: 20,
        category: categories[4]._id, // Fastfood
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        isActive: true,
      },
      {
        restaurant: restaurants[0]._id,
        name: 'Happy Hour - Đồ uống',
        description: 'Giảm 25% cho đồ uống từ 14h-16h',
        discountPercent: 25,
        category: categories[3]._id, // Đồ uống
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        isActive: true,
      },
    ]);
    console.log('Promotions created:', promotions.length);

    // Reviews - Tạo một số đánh giá mẫu
    const reviews = await Review.create([
      {
        user: initialUsers[1]._id, // John Doe
        product: products[0]._id, // Cơm Tấm Sườn Bì Chả
        rating: 5,
        comment: 'Cơm tấm rất ngon, sườn nướng thơm lừng. Giao hàng nhanh!',
        isVerified: true,
      },
      {
        user: initialUsers[1]._id,
        product: products[2]._id, // Phở Bò Tái
        rating: 5,
        comment: 'Phở ngon, nước dùng đậm đà. Sẽ đặt lại!',
        isVerified: true,
      },
      {
        user: initialUsers[1]._id,
        product: products[4]._id, // Gà Rán 2 Miếng
        rating: 4,
        comment: 'Gà giòn ngon, nhưng hơi ít. Giá hơi cao.',
        isVerified: true,
      },
      {
        user: initialUsers[1]._id,
        product: products[1]._id, // Cơm Tấm Sườn Nướng
        rating: 4,
        comment: 'Ngon, giá phải chăng. Phục vụ tốt.',
        isVerified: false,
      },
      {
        user: initialUsers[1]._id,
        product: products[5]._id, // Combo Gà + Burger
        rating: 5,
        comment: 'Combo rất đáng giá, ngon và đầy đủ!',
        isVerified: true,
        restaurantReply: 'Cảm ơn bạn đã ủng hộ! Hẹn gặp lại.',
        repliedAt: new Date(),
      },
    ]);
    console.log('Reviews created:', reviews.length);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n👥 Login credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 ADMIN (Full System Access):');
    console.log('   Email: admin@foodfast.com');
    console.log('   Password: admin123');
    console.log('   App: admin_app (quản lý toàn bộ hệ thống)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🍽️  RESTAURANT OWNERS (Single Restaurant):');
    console.log('   1. Cơm Tấm Sài Gòn:');
    console.log('      Email: restaurant@foodfast.com');
    console.log('      Password: restaurant123');
    console.log('      App: restaurant_app');
    console.log('   2. Phở Hà Nội:');
    console.log('      Email: pho@foodfast.com');
    console.log('      Password: restaurant123');
    console.log('      App: restaurant_app');
    console.log('   3. KFC HCM:');
    console.log('      Email: kfc@foodfast.com');
    console.log('      Password: restaurant123');
    console.log('      App: restaurant_app');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 CUSTOMER:');
    console.log('   Email: user@foodfast.com');
    console.log('   Password: user123');
    console.log('   App: client_app');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚁 DRONE OPERATORS:');
    console.log('   1. Email: drone@foodfast.com / drone123');
    console.log('   2. Email: dronemanager@example.com / 123456');
    console.log('   App: drone_manage');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedData();
