import { EXECUTION_PARAM_KEY } from "constants/AppsmithActionConstants/ActionConstants";
import type { ValidationConfig } from "./PropertyControlConstants";

// Always add a validator function in ./worker/validation for these types
export enum ValidationTypes {
  TEXT = "TEXT",
  REGEX = "REGEX",
  NUMBER = "NUMBER",
  BOOLEAN = "BOOLEAN",
  OBJECT = "OBJECT",
  ARRAY = "ARRAY",
  OBJECT_ARRAY = "OBJECT_ARRAY",
  NESTED_OBJECT_ARRAY = "NESTED_OBJECT_ARRAY",
  DATE_ISO_STRING = "DATE_ISO_STRING",
  IMAGE_URL = "IMAGE_URL",
  FUNCTION = "FUNCTION",
  SAFE_URL = "SAFE_URL",
  ARRAY_OF_TYPE_OR_TYPE = "ARRAY_OF_TYPE_OR_TYPE",
  UNION = "UNION",
  OBJECT_WITH_PURE_FUNCTIONS = "OBJECT_WITH_PURE_FUNCTIONS"
}

export type ValidationResponse = {
  isValid: boolean;
  parsed: any;
  messages?: Array<Error>;
  transformed?: any;
  isParsedValueTheSame?: boolean;
};

export type Validator = (
  config: ValidationConfig,
  value: unknown,
  props: Record<string, unknown>,
  propertyPath: string,
) => ValidationResponse;

export const ISO_DATE_FORMAT = "YYYY-MM-DDTHH:mm:ss.sssZ";

export const DATATREE_INTERNAL_KEYWORDS = {
  actionPaths: "actionPaths",
  pageList: "pageList",
  [EXECUTION_PARAM_KEY]: EXECUTION_PARAM_KEY,
};

export const DATA_TREE_KEYWORDS = {
  appsmith: "appsmith",
  ...DATATREE_INTERNAL_KEYWORDS,
};

export const JAVASCRIPT_KEYWORDS = {
  abstract: "abstract",
  arguments: "arguments",
  await: "await",
  boolean: "boolean",
  break: "break",
  byte: "byte",
  case: "case",
  catch: "catch",
  char: "char",
  class: "class",
  const: "const",
  continue: "continue",
  debugger: "debugger",
  default: "default",
  delete: "delete",
  do: "do",
  double: "double",
  else: "else",
  enum: "enum",
  eval: "eval",
  export: "export",
  extends: "extends",
  false: "false",
  final: "final",
  finally: "finally",
  float: "float",
  for: "for",
  function: "function",
  goto: "goto",
  if: "if",
  implements: "implements",
  import: "import",
  in: "in",
  instanceof: "instanceof",
  int: "int",
  interface: "interface",
  let: "let",
  long: "long",
  native: "native",
  new: "new",
  null: "null",
  package: "package",
  private: "private",
  protected: "protected",
  public: "public",
  return: "return",
  self: "self",
  short: "short",
  static: "static",
  super: "super",
  switch: "switch",
  synchronized: "synchronized",
  this: "this",
  throw: "throw",
  throws: "throws",
  transient: "transient",
  true: "true",
  try: "try",
  typeof: "typeof",
  var: "var",
  void: "void",
  volatile: "volatile",
  while: "while",
  with: "with",
  yield: "yield",
};

/**
 *  Global scope Identifiers in the worker context, accessible via the "self" keyword.
 * These identifiers are already present in the worker context and shouldn't represent any valid identifier within Appsmith, as no entity should have
 * same name as them to prevent unexpected behaviour during evaluation(which happens on the worker thread) in the worker.
 * Check if an identifier (or window object/property) is available in the worker context here => https://worker-playground.glitch.me/
 */
export const DEDICATED_WORKER_GLOBAL_SCOPE_IDENTIFIERS = {
  AbortController: "AbortController",
  AbortSignal: "AbortSignal",
  AggregateError: "AggregateError",
  Array: "Array",
  ArrayBuffer: "ArrayBuffer",
  atob: "atob",
  Atomics: "Atomics",
  AudioData: "AudioData",
  AudioDecoder: "AudioDecoder",
  AudioEncoder: "AudioEncoder",
  BackgroundFetchManager: "BackgroundFetchManager",
  BackgroundFetchRecord: "BackgroundFetchRecord",
  BackgroundFetchRegistration: "BackgroundFetchRegistration",
  BarcodeDetector: "BarcodeDetector",
  BigInt: "BigInt",
  BigInt64Array: "BigInt64Array",
  BigUint64Array: "BigUint64Array",
  Blob: "Blob",
  Boolean: "Boolean",
  btoa: "btoa",
  BroadcastChannel: "BroadcastChannel",
  ByteLengthQueuingStrategy: "ByteLengthQueuingStrategy",
  caches: "caches",
  CSSSkewX: "CSSSkewX",
  CSSSkewY: "CSSSkewY",
  Cache: "Cache",
  CacheStorage: "CacheStorage",
  cancelAnimationFrame: "cancelAnimationFrame",
  CanvasFilter: "CanvasFilter",
  CanvasGradient: "CanvasGradient",
  CanvasPattern: "CanvasPattern",
  clearInterval: "clearInterval",
  clearTimeout: "clearTimeout",
  close: "close",
  CloseEvent: "CloseEvent",
  CompressionStream: "CompressionStream",
  console: "console",
  CountQueuingStrategy: "CountQueuingStrategy",
  createImageBitmap: "createImageBitmap",
  CropTarget: "CropTarget",
  crossOriginIsolated: "crossOriginIsolated",
  Crypto: "Crypto",
  CryptoKey: "CryptoKey",
  CustomEvent: "CustomEvent",
  decodeURI: "decodeURI",
  decodeURIComponent: "decodeURIComponent",
  DOMException: "DOMException",
  DOMMatrix: "DOMMatrix",
  DOMMatrixReadOnly: "DOMMatrixReadOnly",
  DOMPoint: "DOMPoint",
  DOMPointReadOnly: "DOMPointReadOnly",
  DOMQuad: "DOMQuad",
  DOMRect: "DOMRect",
  DOMRectReadOnly: "DOMRectReadOnly",
  DOMStringList: "DOMStringList",
  DataView: "DataView",
  Date: "Date",
  DecompressionStream: "DecompressionStream",
  DedicatedWorkerGlobalScope: "DedicatedWorkerGlobalScope",
  encodeURI: "encodeURI",
  encodeURIComponent: "encodeURIComponent",
  EncodedAudioChunk: "EncodedAudioChunk",
  EncodedVideoChunk: "EncodedVideoChunk",
  Error: "Error",
  ErrorEvent: "ErrorEvent",
  escape: "escape",
  eval: "eval",
  EvalError: "EvalError",
  Event: "Event",
  EventSource: "EventSource",
  EventTarget: "EventTarget",
  fetch: "fetch",
  File: "File",
  FileList: "FileList",
  FileReader: "FileReader",
  FileReaderSync: "FileReaderSync",
  FileSystemDirectoryHandle: "FileSystemDirectoryHandle",
  FileSystemFileHandle: "FileSystemFileHandle",
  FileSystemHandle: "FileSystemHandle",
  FileSystemSyncAccessHandle: "FileSystemSyncAccessHandle",
  FileSystemWritableFileStream: "FileSystemWritableFileStream",
  FinalizationRegistry: "FinalizationRegistry",
  Float32Array: "Float32Array",
  Float64Array: "Float64Array",
  fonts: "fonts",
  FontFace: "FontFace",
  FormData: "FormData",
  Function: "Function",
  globalThis: "globalThis",
  hasOwnProperty: "hasOwnProperty",
  Headers: "Headers",
  IDBCursor: "IDBCursor",
  IDBCursorWithValue: "IDBCursorWithValue",
  IDBDatabase: "IDBDatabase",
  IDBFactory: "IDBFactory",
  IDBIndex: "IDBIndex",
  IDBKeyRange: "IDBKeyRange",
  IDBObjectStore: "IDBObjectStore",
  IDBOpenDBRequest: "IDBOpenDBRequest",
  IDBRequest: "IDBRequest",
  IDBTransaction: "IDBTransaction",
  IDBVersionChangeEvent: "IDBVersionChangeEvent",
  IdleDetector: "IdleDetector",
  ImageBitmap: "ImageBitmap",
  ImageBitmapRenderingContext: "ImageBitmapRenderingContext",
  ImageData: "ImageData",
  ImageDecoder: "ImageDecoder",
  ImageTrack: "ImageTrack",
  ImageTrackList: "ImageTrackList",
  importScripts: "importScripts",
  indexedDB: "indexedDB",
  Infinity: "Infinity",
  Int8Array: "Int8Array",
  Int16Array: "Int16Array",
  Int32Array: "Int32Array",
  Intl: "Intl",
  isFinite: "isFinite",
  isNaN: "isNaN",
  isPrototypeOf: "isPrototypeOf",
  isSecureContext: "isSecureContext",
  JSON: "JSON",
  Lock: "Lock",
  LockManager: "LockManager",
  location: "location",
  Map: "Map",
  Math: "Math",
  MediaCapabilities: "MediaCapabilities",
  MessageChannel: "MessageChannel",
  MessageEvent: "MessageEvent",
  MessagePort: "MessagePort",
  NaN: "NaN",
  name: "name",
  navigator: "navigator",
  NavigationPreloadManager: "NavigationPreloadManager",
  NavigatorUAData: "NavigatorUAData",
  NetworkInformation: "NetworkInformation",
  Notification: "Notification",
  Number: "Number",
  onerror: "onerror",
  onmessage: "onmessage",
  onmessageerror: "onmessageerror",
  onlanguagechange: "onlanguagechange",
  onrejectionhandled: "onrejectionhandled",
  onunhandledrejection: "onunhandledrejection",
  origin: "origin",
  Object: "Object",
  OffscreenCanvas: "OffscreenCanvas",
  OffscreenCanvasRenderingContext2D: "OffscreenCanvasRenderingContext2D",
  parseFloat: "parseFloat",
  parseInt: "parseInt",
  Path2D: "Path2D",
  PaymentInstruments: "PaymentInstruments",
  performance: "performance",
  Performance: "Performance",
  PerformanceEntry: "PerformanceEntry",
  PerformanceMark: "PerformanceMark",
  PerformanceMeasure: "PerformanceMeasure",
  PerformanceObserver: "PerformanceObserver",
  PerformanceObserverEntryList: "PerformanceObserverEntryList",
  PerformanceResourceTiming: "PerformanceResourceTiming",
  PerformanceServerTiming: "PerformanceServerTiming",
  PeriodicSyncManager: "PeriodicSyncManager",
  PermissionStatus: "PermissionStatus",
  Permissions: "Permissions",
  postMessage: "postMessage",
  ProgressEvent: "ProgressEvent",
  Promise: "Promise",
  PromiseRejectionEvent: "PromiseRejectionEvent",
  Proxy: "Proxy",
  PushManager: "PushManager",
  PushSubscription: "PushSubscription",
  PushSubscriptionOptions: "PushSubscriptionOptions",
  queueMicrotask: "queueMicrotask",
  RTCEncodedAudioFrame: "RTCEncodedAudioFrame",
  RTCEncodedVideoFrame: "RTCEncodedVideoFrame",
  RangeError: "RangeError",
  ReadableByteStreamController: "ReadableByteStreamController",
  ReadableStream: "ReadableStream",
  ReadableStreamBYOBReader: "ReadableStreamBYOBReader",
  ReadableStreamBYOBRequest: "ReadableStreamBYOBRequest",
  ReadableStreamDefaultController: "ReadableStreamDefaultController",
  ReadableStreamDefaultReader: "ReadableStreamDefaultReader",
  ReferenceError: "ReferenceError",
  Reflect: "Reflect",
  RegExp: "RegExp",
  reportError: "reportError",
  ReportingObserver: "ReportingObserver",
  Request: "Request",
  requestAnimationFrame: "requestAnimationFrame",
  Response: "Response",
  scheduler: "scheduler",
  Scheduler: "Scheduler",
  SecurityPolicyViolationEvent: "SecurityPolicyViolationEvent",
  Serial: "Serial",
  SerialPort: "SerialPort",
  ServiceWorkerRegistration: "ServiceWorkerRegistration",
  Set: "Set",
  setInterval: "setInterval",
  setTimeout: "setTimeout",
  StorageManager: "StorageManager",
  String: "String",
  structuredClone: "structuredClone",
  SubtleCrypto: "SubtleCrypto",
  Symbol: "Symbol",
  SyncManager: "SyncManager",
  SyntaxError: "SyntaxError",
  TaskController: "TaskController",
  TaskPriorityChangeEvent: "TaskPriorityChangeEvent",
  TaskSignal: "TaskSignal",
  TextDecoder: "TextDecoder",
  TextDecoderStream: "TextDecoderStream",
  TextEncoder: "TextEncoder",
  TextEncoderStream: "TextEncoderStream",
  TextMetrics: "TextMetrics",
  toString: "toString",
  TransformStream: "TransformStream",
  TransformStreamDefaultController: "TransformStreamDefaultController",
  TrustedHTML: "TrustedHTML",
  TrustedScript: "TrustedScript",
  TrustedScriptURL: "TrustedScriptURL",
  trustedTypes: "trustedTypes",
  TrustedTypePolicy: "TrustedTypePolicy",
  TrustedTypePolicyFactory: "TrustedTypePolicyFactory",
  TypeError: "TypeError",
  undefined: "undefined",
  unescape: "unescape",
  URIError: "URIError",
  URL: "URL",
  URLPattern: "URLPattern",
  URLSearchParams: "URLSearchParams",
  USB: "USB",
  USBAlternateInterface: "USBAlternateInterface",
  USBConfiguration: "USBConfiguration",
  USBConnectionEvent: "USBConnectionEvent",
  USBDevice: "USBDevice",
  USBEndpoint: "USBEndpoint",
  USBInTransferResult: "USBInTransferResult",
  USBInterface: "USBInterface",
  USBIsochronousInTransferPacket: "USBIsochronousInTransferPacket",
  USBIsochronousInTransferResult: "USBIsochronousInTransferResult",
  USBIsochronousOutTransferPacket: "USBIsochronousOutTransferPacket",
  USBIsochronousOutTransferResult: "USBIsochronousOutTransferResult",
  USBOutTransferResult: "USBOutTransferResult",
  Uint8Array: "Uint8Array",
  Uint8ClampedArray: "Uint8ClampedArray",
  Uint16Array: "Uint16Array",
  Uint32Array: "Uint32Array",
  UserActivation: "UserActivation",
  VideoColorSpace: "VideoColorSpace",
  VideoDecoder: "VideoDecoder",
  VideoEncoder: "VideoEncoder",
  VideoFrame: "VideoFrame",
  WeakMap: "WeakMap",
  WeakRef: "WeakRef",
  WeakSet: "WeakSet",
  WebAssembly: "WebAssembly",
  WebGL2RenderingContext: "WebGL2RenderingContext",
  WebGLActiveInfo: "WebGLActiveInfo",
  WebGLBuffer: "WebGLBuffer",
  WebGLFramebuffer: "WebGLFramebuffer",
  WebGLProgram: "WebGLProgram",
  WebGLQuery: "WebGLQuery",
  WebGLRenderbuffer: "WebGLRenderbuffer",
  WebGLRenderingContext: "WebGLRenderingContext",
  WebGLSampler: "WebGLSampler",
  WebGLShader: "WebGLShader",
  WebGLShaderPrecisionFormat: "WebGLShaderPrecisionFormat",
  WebGLSync: "WebGLSync",
  WebGLTexture: "WebGLTexture",
  WebGLTransformFeedback: "WebGLTransformFeedback",
  WebGLUniformLocation: "WebGLUniformLocation",
  WebGLVertexArrayObject: "WebGLVertexArrayObject",
  webkitRequestFileSystem: "webkitRequestFileSystem",
  webkitRequestFileSystemSync: "webkitRequestFileSystemSync",
  webkitResolveLocalFileSystemSyncURL: "webkitResolveLocalFileSystemSyncURL",
  webkitResolveLocalFileSystemURL: "webkitResolveLocalFileSystemURL",
  WebSocket: "WebSocket",
  WebTransport: "WebTransport",
  WebTransportBidirectionalStream: "WebTransportBidirectionalStream",
  WebTransportDatagramDuplexStream: "WebTransportDatagramDuplexStream",
  WebTransportError: "WebTransportError",
  Worker: "Worker",
  WorkerGlobalScope: "WorkerGlobalScope",
  WorkerLocation: "WorkerLocation",
  WorkerNavigator: "WorkerNavigator",
  WritableStream: "WritableStream",
  WritableStreamDefaultController: "WritableStreamDefaultController",
  WritableStreamDefaultWriter: "WritableStreamDefaultWriter",
  XMLHttpRequest: "XMLHttpRequest",
  XMLHttpRequestEventTarget: "XMLHttpRequestEventTarget",
  XMLHttpRequestUpload: "XMLHttpRequestUpload",

  // Identifiers added to worker scope by Appsmith
  evaluationVersion: "evaluationVersion",
  $isDataField: "$isDataField",
  $isAsync: "$isAsync",
};
