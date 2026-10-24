import mongoose from 'mongoose';

export const isDbReady = () => mongoose.connection.readyState === 1;

/**
 * Kết nối MongoDB và TỰ KẾT NỐI LẠI nếu thất bại.
 * Trước đây khi Atlas chập chờn (đổi IP, mạng yếu) tiến trình backend bị `process.exit(1)` nên giao diện
 * báo "Network Error" lúc có lúc không. Giờ backend luôn sống và trả lỗi 503 rõ ràng cho tới khi DB sẵn sàng.
 */
export default function connectDB(onReady?: () => void) {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/agritech_db';
  let attempts = 0;

  const tryConnect = async () => {
    attempts += 1;
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 8000,
        socketTimeoutMS: 45000,
        bufferCommands: false, // lỗi ngay thay vì treo 10 giây khi DB chưa sẵn sàng
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      onReady?.();
    } catch (error: any) {
      const wait = Math.min(5000 * attempts, 30000);
      console.error(`❌ MongoDB connection failed (lần ${attempts}): ${error.message}`);
      console.error(`   Thử lại sau ${wait / 1000}s. Kiểm tra MONGO_URI và danh sách IP được phép trên MongoDB Atlas.`);
      setTimeout(tryConnect, wait);
    }
  };

  mongoose.connection.on('disconnected', () => console.warn('⚠️  MongoDB disconnected - driver sẽ tự kết nối lại'));
  mongoose.connection.on('reconnected', () => console.log('✅ MongoDB reconnected'));

  void tryConnect();
}
