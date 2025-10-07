/**
 * 水控器协议适配器 - 处理固件更新后的兼容性问题
 * 针对深圳市常工电子蓝牙水控器的新版固件适配
 */

import { log } from "./logger";
import { bufferToHexString } from "./utils";

// 新版固件的扩展状态码
export const NEW_FIRMWARE_CODES = {
  0x7A: "NEW_AUTH_STEP",     // 新的认证步骤
  0x98: "EXTENDED_HANDSHAKE", // 扩展握手
  0x04: "VERSION_INFO",       // 版本信息
  0x8E: "KEY_EXCHANGE",       // 密钥交换
  0x47: "STATUS_UPDATE",      // 状态更新
  0x25: "SYNC_REQUEST",       // 同步请求
  0x84: "CHALLENGE_RESPONSE", // 挑战响应
} as const;

// 固件版本检测
export function detectFirmwareVersion(payload: Uint8Array): string {
  // 检测新版固件特征
  if (payload.includes(0x98) && payload.includes(0x04)) {
    return "NEW_V2";
  }
  // NEW_V1的特征：包含0x7A或0x8E，或者是0xb0/0xae/0xaf握手序列
  if (payload.includes(0x7A) || payload.includes(0x8E) || 
      payload.includes(0xb0) || payload.includes(0xae) || payload.includes(0xaf)) {
    return "NEW_V1";
  }
  return "LEGACY";
}

// 增强的协议处理器
export class ProtocolAdapter {
  private firmwareVersion: string = "UNKNOWN";
  private authState: string = "INIT";
  private retryCount: number = 0;
  private maxRetries: number = 3;

  constructor() {
    log("协议适配器初始化");
  }

  // 处理接收到的数据包
  async handlePacket(payload: Uint8Array, txdCharacteristic: BluetoothRemoteGATTCharacteristic): Promise<boolean> {
    log(`接收数据: ${bufferToHexString(payload.buffer as ArrayBuffer)}`);
    
    // 自动检测固件版本
    if (this.firmwareVersion === "UNKNOWN") {
      this.firmwareVersion = detectFirmwareVersion(payload);
      log(`检测到固件版本: ${this.firmwareVersion}`);
    }

    const dType = payload[3];
    const subType = payload.length > 5 ? payload[5] : 0x00;

    try {
      switch (this.firmwareVersion) {
        case "NEW_V2":
          return await this.handleNewV2Protocol(dType, subType, payload, txdCharacteristic);
        case "NEW_V1":
          return await this.handleNewV1Protocol(dType, subType, payload, txdCharacteristic);
        default:
          return await this.handleLegacyProtocol(dType, subType, payload, txdCharacteristic);
      }
    } catch (error) {
      log(`协议处理错误: ${error}`);
      return await this.handleRetry(payload, txdCharacteristic);
    }
  }

  // 处理新版V2协议
  private async handleNewV2Protocol(dType: number, subType: number, payload: Uint8Array, txdCharacteristic: BluetoothRemoteGATTCharacteristic): Promise<boolean> {
    log(`处理V2协议 - dType: 0x${dType.toString(16)}, subType: 0x${subType.toString(16)}`);

    switch (dType) {
      case 0x98: // 扩展握手
        return await this.handleExtendedHandshake(payload, txdCharacteristic);
      case 0x7A: // 新认证步骤
        return await this.handleNewAuthStep(payload, txdCharacteristic);
      case 0x04: // 版本信息
        return await this.handleVersionInfo(payload, txdCharacteristic);
      default:
        // 回退到标准处理
        return false;
    }
  }

  // 处理新版V1协议
  private async handleNewV1Protocol(dType: number, _subType: number, payload: Uint8Array, txdCharacteristic: BluetoothRemoteGATTCharacteristic): Promise<boolean> {
    log(`处理V1协议 - dType: 0x${dType.toString(16)}`);

    switch (dType) {
      case 0xb0: // 初始握手
        log("忽略0xb0握手包，由原有逻辑处理");
        return false; // 让原有逻辑处理
      case 0xae: // 密钥请求
        log("忽略0xae密钥包，由原有逻辑处理");
        return false; // 让原有逻辑处理
      case 0xaf: // 认证响应
        log("忽略0xaf认证包，由原有逻辑处理");
        return false; // 让原有逻辑处理
      case 0x7A:
        return await this.handleNewAuthStep(payload, txdCharacteristic);
      case 0x8E:
        return await this.handleKeyExchange(payload, txdCharacteristic);
      default:
        return false;
    }
  }

  // 处理遗留协议
  private async handleLegacyProtocol(_dType: number, _subType: number, _payload: Uint8Array, _txdCharacteristic: BluetoothRemoteGATTCharacteristic): Promise<boolean> {
    // 这里返回false，让原有逻辑处理
    return false;
  }

  // 处理扩展握手 (0x98)
  private async handleExtendedHandshake(_payload: Uint8Array, txdCharacteristic: BluetoothRemoteGATTCharacteristic): Promise<boolean> {
    log("处理扩展握手");
    
    // 构造扩展握手响应
    const response = new Uint8Array([
      0xFE, 0xFE, 0x09, 0x98,
      0x04, 0x00, 0x00, 0x01,  // 确认扩展协议支持
      ...this.generateTimestamp(),
      0x00, 0x00
    ]);

    await this.sendWithDelay(txdCharacteristic, response, 200);
    this.authState = "EXTENDED_HANDSHAKE_SENT";
    return true;
  }

  // 处理新认证步骤 (0x7A)
  private async handleNewAuthStep(payload: Uint8Array, txdCharacteristic: BluetoothRemoteGATTCharacteristic): Promise<boolean> {
    log("处理新认证步骤");
    
    // 分析载荷中的认证要求
    const authType = payload.length > 4 ? payload[4] : 0x01;
    
    const response = new Uint8Array([
      0xFE, 0xFE, 0x09, 0x7A,
      authType, 0x01, 0x02, 0x01,  // 认证确认
      0x03, 0x04, 0x05, 0x06,      // 扩展参数
      0x07, 0x08, 0x09, 0x10,
      0x11, 0x12
    ]);

    await this.sendWithDelay(txdCharacteristic, response, 300);
    this.authState = "NEW_AUTH_SENT";
    return true;
  }

  // 处理版本信息 (0x04)
  private async handleVersionInfo(_payload: Uint8Array, txdCharacteristic: BluetoothRemoteGATTCharacteristic): Promise<boolean> {
    log("处理版本信息请求");
    
    const response = new Uint8Array([
      0xFE, 0xFE, 0x09, 0x04,
      0x01, 0x00,  // 版本确认
    ]);

    await this.sendWithDelay(txdCharacteristic, response, 100);
    return true;
  }

  // 处理密钥交换 (0x8E)
  private async handleKeyExchange(payload: Uint8Array, txdCharacteristic: BluetoothRemoteGATTCharacteristic): Promise<boolean> {
    log("处理密钥交换");
    
    // 提取挑战数据
    const challengeData = payload.slice(4, 8);
    
    const response = new Uint8Array([
      0xFE, 0xFE, 0x09, 0x8E,
      ...challengeData,  // 回显挑战数据
      0x01, 0x02, 0x03, 0x04  // 密钥响应
    ]);

    await this.sendWithDelay(txdCharacteristic, response, 250);
    return true;
  }

  // 重试机制
  private async handleRetry(payload: Uint8Array, txdCharacteristic: BluetoothRemoteGATTCharacteristic): Promise<boolean> {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      log(`尝试重试 (${this.retryCount}/${this.maxRetries})`);
      
      // 发送通用确认响应
      const genericResponse = new Uint8Array([
        0xFE, 0xFE, 0x09, payload[3],
        0x01, 0x00
      ]);
      
      await this.sendWithDelay(txdCharacteristic, genericResponse, 500);
      return true;
    }
    
    log("重试次数已达上限");
    return false;
  }

  // 带延时的发送
  private async sendWithDelay(characteristic: BluetoothRemoteGATTCharacteristic, data: Uint8Array, delayMs: number): Promise<void> {
    log(`发送数据: ${bufferToHexString(data.buffer as ArrayBuffer)} (延时: ${delayMs}ms)`);
    
    await new Promise(resolve => setTimeout(resolve, delayMs));
    await characteristic.writeValue(data as BufferSource);
  }

  // 生成时间戳
  private generateTimestamp(): Uint8Array {
    const now = new Date();
    return new Uint8Array([
      now.getSeconds() & 0xFF,
      now.getMinutes() & 0xFF,
      now.getHours() & 0xFF,
      now.getDate() & 0xFF
    ]);
  }

  // 重置适配器状态
  public reset(): void {
    this.firmwareVersion = "UNKNOWN";
    this.authState = "INIT";
    this.retryCount = 0;
    log("协议适配器已重置");
  }

  // 获取当前状态
  public getStatus(): { firmware: string, auth: string, retries: number } {
    return {
      firmware: this.firmwareVersion,
      auth: this.authState,
      retries: this.retryCount
    };
  }
}