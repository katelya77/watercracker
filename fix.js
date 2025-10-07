// 修复认证失败处理的JavaScript代码
// 这段代码将替换现有的0x39处理逻辑

if (statusCode === 0x39) {
  console.log("🚨 密钥验证失败 - 立即断开连接");
  console.log("👤 模拟正常用户：认证失败后立即断开");
  
  updateWaterStatus("❌ 认证失败，连接已断开");
  
  // 立即断开蓝牙连接
  try {
    if (bluetoothDevice && bluetoothDevice.gatt.connected) {
      console.log("🔌 断开蓝牙连接");
      bluetoothDevice.gatt.disconnect();
    }
  } catch (err) {
    console.log("断开连接出错:", err);
  }
  
  // 重置所有状态
  isStarted = false;
  txdCharacteristic = null;
  rxdCharacteristic = null;
  
  return; // 完全退出，不执行任何破解
}