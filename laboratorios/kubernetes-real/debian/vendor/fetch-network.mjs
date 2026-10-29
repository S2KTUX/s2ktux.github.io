// Adaptador de archivos HTTP de v86 (BSD-2-Clause). Fuentes: ../../motor-experimento/fuentes-jit8192/src/browser/{fetch_network,fake_network}.js. Archivo HTTP local; licencia en LICENSE-v86-network.txt.
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b2) => (typeof require !== "undefined" ? require : a)[b2]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});

// ../prototipo-contenedores-web/kubernetes-real/motor-experimento/fuentes-jit8192/src/const.js
var LOG_ALL = -1;
var LOG_CPU = 2;
var LOG_FPU = 4;
var LOG_MEM = 8;
var LOG_DMA = 16;
var LOG_IO = 32;
var LOG_PS2 = 64;
var LOG_PIC = 128;
var LOG_VGA = 256;
var LOG_PIT = 512;
var LOG_MOUSE = 1024;
var LOG_PCI = 2048;
var LOG_BIOS = 4096;
var LOG_FLOPPY = 8192;
var LOG_SERIAL = 16384;
var LOG_DISK = 32768;
var LOG_RTC = 65536;
var LOG_ACPI = 262144;
var LOG_APIC = 524288;
var LOG_NET = 1048576;
var LOG_VIRTIO = 2097152;
var LOG_9P = 4194304;
var LOG_SB16 = 8388608;
var LOG_FETCH = 16777216;
var LOG_MODEM = 33554432;
var LOG_NAMES = [
  [1, ""],
  [LOG_CPU, "CPU"],
  [LOG_DISK, "DISK"],
  [LOG_FPU, "FPU"],
  [LOG_MEM, "MEM"],
  [LOG_DMA, "DMA"],
  [LOG_IO, "IO"],
  [LOG_PS2, "PS2"],
  [LOG_PIC, "PIC"],
  [LOG_VGA, "VGA"],
  [LOG_PIT, "PIT"],
  [LOG_MOUSE, "MOUS"],
  [LOG_PCI, "PCI"],
  [LOG_BIOS, "BIOS"],
  [LOG_FLOPPY, "FLOP"],
  [LOG_SERIAL, "SERI"],
  [LOG_RTC, "RTC"],
  [LOG_ACPI, "ACPI"],
  [LOG_APIC, "APIC"],
  [LOG_NET, "NET"],
  [LOG_VIRTIO, "VIO"],
  [LOG_9P, "9P"],
  [LOG_SB16, "SB16"],
  [LOG_FETCH, "FETC"],
  [LOG_MODEM, "MODM"]
];
var FLAG_IOPL = 1 << 12 | 1 << 13;
var FLAG_NT = 1 << 14;
var FLAG_RF = 1 << 16;
var FLAG_VM = 1 << 17;
var FLAG_AC = 1 << 18;
var FLAG_VIF = 1 << 19;
var FLAG_VIP = 1 << 20;
var FLAG_ID = 1 << 21;
var FLAGS_DEFAULT = 1 << 1;
var MMAP_BLOCK_BITS = 17;
var MMAP_BLOCK_SIZE = 1 << MMAP_BLOCK_BITS;
var CR0_PG = 1 << 31;
var CR4_PAE = 1 << 5;

// ../prototipo-contenedores-web/kubernetes-real/motor-experimento/fuentes-jit8192/src/lib.js
function pads(str, len) {
  str = str || str === 0 ? str + "" : "";
  return str.padEnd(len, " ");
}
function pad0(str, len) {
  str = str || str === 0 ? str + "" : "";
  return str.padStart(len, "0");
}
function h(n, len) {
  if (!n) {
    var str = "";
  } else {
    var str = n.toString(16);
  }
  return "0x" + pad0(str.toUpperCase(), len || 1);
}
var get_rand_int;
if (typeof crypto !== "undefined" && crypto.getRandomValues) {
  const rand_data = new Int32Array(1);
  get_rand_int = function() {
    crypto.getRandomValues(rand_data);
    return rand_data[0];
  };
} else if (typeof __require !== "undefined") {
  const crypto2 = __require("crypto");
  get_rand_int = function() {
    return crypto2.randomBytes(4)["readInt32LE"](0);
  };
} else if (typeof process !== "undefined") {
  import("node:crypto").then((crypto2) => {
    get_rand_int = function() {
      return crypto2["randomBytes"](4)["readInt32LE"](0);
    };
  });
} else {
  dbg_assert(false, "Unsupported platform: No cryptographic random values");
}
var int_log2;
if (typeof Math.clz32 === "function" && Math.clz32(0) === 32 && Math.clz32(74565) === 15 && Math.clz32(-1) === 0) {
  int_log2 = function(x) {
    dbg_assert(x > 0);
    return 31 - Math.clz32(x);
  };
} else {
  int_log2_table = new Int8Array(256);
  for (i = 0, b = -2; i < 256; i++) {
    if (!(i & i - 1))
      b++;
    int_log2_table[i] = b;
  }
  int_log2 = function(x) {
    x >>>= 0;
    dbg_assert(x > 0);
    var tt = x >>> 16;
    if (tt) {
      var t = tt >>> 8;
      if (t) {
        return 24 + int_log2_table[t];
      } else {
        return 16 + int_log2_table[tt];
      }
    } else {
      var t = x >>> 8;
      if (t) {
        return 8 + int_log2_table[t];
      } else {
        return int_log2_table[x];
      }
    }
  };
}
var int_log2_table;
var i;
var b;
if (false) {
  dbg_assert(int_log2(1) === 0);
  dbg_assert(int_log2(2) === 1);
  dbg_assert(int_log2(7) === 2);
  dbg_assert(int_log2(8) === 3);
  dbg_assert(int_log2(123456789) === 26);
  dbg_assert(round_up_to_next_power_of_2(0) === 1);
  dbg_assert(round_up_to_next_power_of_2(1) === 1);
  dbg_assert(round_up_to_next_power_of_2(2) === 2);
  dbg_assert(round_up_to_next_power_of_2(7) === 8);
  dbg_assert(round_up_to_next_power_of_2(8) === 8);
  dbg_assert(round_up_to_next_power_of_2(123456789) === 134217728);
}
function FloatQueue(size) {
  this.size = size;
  this.data = new Float32Array(size);
  this.start = 0;
  this.end = 0;
  this.length = 0;
  dbg_assert((size & size - 1) === 0);
}
FloatQueue.prototype.push = function(item) {
  if (this.length === this.size) {
    this.start = this.start + 1 & this.size - 1;
  } else {
    this.length++;
  }
  this.data[this.end] = item;
  this.end = this.end + 1 & this.size - 1;
};
FloatQueue.prototype.shift = function() {
  if (!this.length) {
    return void 0;
  } else {
    var item = this.data[this.start];
    this.start = this.start + 1 & this.size - 1;
    this.length--;
    return item;
  }
};
FloatQueue.prototype.shift_block = function(count) {
  var slice = new Float32Array(count);
  if (count > this.length) {
    count = this.length;
  }
  var slice_end = this.start + count;
  var partial = this.data.subarray(this.start, slice_end);
  slice.set(partial);
  if (slice_end >= this.size) {
    slice_end -= this.size;
    slice.set(this.data.subarray(0, slice_end), partial.length);
  }
  this.start = slice_end;
  this.length -= count;
  return slice;
};
FloatQueue.prototype.peek = function() {
  if (!this.length) {
    return void 0;
  } else {
    return this.data[this.start];
  }
};
FloatQueue.prototype.clear = function() {
  this.start = 0;
  this.end = 0;
  this.length = 0;
};
function CircularQueue(size) {
  this.data = [];
  this.index = 0;
  this.size = size;
}
CircularQueue.prototype.add = function(item) {
  this.data[this.index] = item;
  this.index = (this.index + 1) % this.size;
};
CircularQueue.prototype.toArray = function() {
  return [].slice.call(this.data, this.index).concat([].slice.call(this.data, 0, this.index));
};
CircularQueue.prototype.clear = function() {
  this.data = [];
  this.index = 0;
};
CircularQueue.prototype.set = function(new_data) {
  this.data = new_data;
  this.index = 0;
};
var Bitmap = function(length_or_buffer) {
  if (typeof length_or_buffer === "number") {
    this.view = new Uint8Array(length_or_buffer + 7 >> 3);
  } else if (length_or_buffer instanceof ArrayBuffer) {
    this.view = new Uint8Array(length_or_buffer);
  } else {
    dbg_assert(false, "Bitmap: Invalid argument");
  }
};
Bitmap.prototype.set = function(index, value) {
  const bit_index = index & 7;
  const byte_index = index >> 3;
  const bit_mask = 1 << bit_index;
  this.view[byte_index] = value ? this.view[byte_index] | bit_mask : this.view[byte_index] & ~bit_mask;
};
Bitmap.prototype.get = function(index) {
  const bit_index = index & 7;
  const byte_index = index >> 3;
  return this.view[byte_index] >> bit_index & 1;
};
Bitmap.prototype.get_buffer = function() {
  return this.view.buffer;
};
var load_file;
var get_file_size;
if (typeof XMLHttpRequest === "undefined" || typeof process !== "undefined" && process.versions && process.versions.node) {
  let fs;
  const get_fs = async function() {
    if (typeof __require !== "undefined") {
      return __require("fs")["promises"];
    }
    return import("node:fs/promises");
  };
  load_file = async function(filename, options, n_tries) {
    if (!fs) {
      fs = await get_fs();
    }
    if (options.range) {
      dbg_assert(!options.as_json);
      const fd = await fs["open"](filename, "r");
      const length = options.range.length;
      const buffer = Buffer.allocUnsafe(length);
      try {
        const result = await fd["read"]({
          buffer,
          position: options.range.start
        });
        dbg_assert(result.bytesRead === length);
      } finally {
        await fd["close"]();
      }
      options.done && options.done(new Uint8Array(buffer));
    } else {
      const o = {
        encoding: options.as_json ? "utf-8" : null
      };
      const data = await fs["readFile"](filename, o);
      const result = options.as_json ? JSON.parse(data) : new Uint8Array(data).buffer;
      options.done(result);
    }
  };
  get_file_size = async function(path) {
    if (!fs) {
      fs = await get_fs();
    }
    const stat = await fs["stat"](path);
    return stat.size;
  };
} else {
  load_file = async function(filename, options, n_tries) {
    var http = new XMLHttpRequest();
    const abort = () => http.abort();
    if (options.signal) {
      if (options.signal.aborted) return;
      options.signal.addEventListener("abort", abort, { once: true });
    }
    http.open(options.method || "get", filename, true);
    if (options.as_json) {
      http.responseType = "json";
    } else {
      http.responseType = "arraybuffer";
    }
    if (options.headers) {
      var header_names = Object.keys(options.headers);
      for (var i2 = 0; i2 < header_names.length; i2++) {
        var name = header_names[i2];
        http.setRequestHeader(name, options.headers[name]);
      }
    }
    if (options.range) {
      const start = options.range.start;
      const end = start + options.range.length - 1;
      http.setRequestHeader("Range", "bytes=" + start + "-" + end);
      http.setRequestHeader("X-Accept-Encoding", "identity");
      http.onreadystatechange = function() {
        if (http.status === 200) {
          console.error("Server sent full file in response to ranged request, aborting", { filename });
          http.abort();
        }
      };
    }
    http.onload = function(e) {
      if (options.signal) options.signal.removeEventListener("abort", abort);
      if (http.readyState === 4) {
        if (http.status !== 200 && http.status !== 206) {
          console.error("Loading the image " + filename + " failed (status %d)", http.status);
          if (http.status >= 500 && http.status < 600) {
            retry();
          }
        } else if (http.response) {
          if (options.range) {
            const enc = http.getResponseHeader("Content-Encoding");
            if (enc && enc !== "identity") {
              console.error("Server sent Content-Encoding in response to ranged request", { filename, enc });
            }
          }
          options.done && options.done(http.response, http);
        }
      }
    };
    http.onerror = function(e) {
      if (options.signal) options.signal.removeEventListener("abort", abort);
      console.error("Loading the image " + filename + " failed", e);
      retry();
    };
    if (options.progress) {
      http.onprogress = function(e) {
        options.progress(e);
      };
    }
    http.send(null);
    function retry() {
      const number_of_tries = n_tries || 0;
      const timeout = [1, 1, 2, 3, 5, 8, 13, 21][number_of_tries] || 34;
      setTimeout(() => {
        load_file(filename, options, number_of_tries + 1);
      }, 1e3 * timeout);
    }
  };
  get_file_size = async function(url) {
    return new Promise((resolve, reject) => {
      load_file(url, {
        done: (buffer, http) => {
          var header = http.getResponseHeader("Content-Range") || "";
          var match = header.match(/\/(\d+)\s*$/);
          if (match) {
            resolve(+match[1]);
          } else {
            const error = new Error("`Range: bytes=...` header not supported (Got `" + header + "`)");
            reject(error);
          }
        },
        headers: {
          Range: "bytes=0-0",
          "X-Accept-Encoding": "identity"
        }
      });
    });
  };
}
var CHARMAPS = {
  cp437: " \u263A\u263B\u2665\u2666\u2663\u2660\u2022\u25D8\u25CB\u25D9\u2642\u2640\u266A\u266B\u263C\u25BA\u25C4\u2195\u203C\xB6\xA7\u25AC\u21A8\u2191\u2193\u2192\u2190\u221F\u2194\u25B2\u25BC !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~\u2302\xC7\xFC\xE9\xE2\xE4\xE0\xE5\xE7\xEA\xEB\xE8\xEF\xEE\xEC\xC4\xC5\xC9\xE6\xC6\xF4\xF6\xF2\xFB\xF9\xFF\xD6\xDC\xA2\xA3\xA5\u20A7\u0192\xE1\xED\xF3\xFA\xF1\xD1\xAA\xBA\xBF\u2310\xAC\xBD\xBC\xA1\xAB\xBB\u2591\u2592\u2593\u2502\u2524\u2561\u2562\u2556\u2555\u2563\u2551\u2557\u255D\u255C\u255B\u2510\u2514\u2534\u252C\u251C\u2500\u253C\u255E\u255F\u255A\u2554\u2569\u2566\u2560\u2550\u256C\u2567\u2568\u2564\u2565\u2559\u2558\u2552\u2553\u256B\u256A\u2518\u250C\u2588\u2584\u258C\u2590\u2580\u03B1\xDF\u0393\u03C0\u03A3\u03C3\xB5\u03C4\u03A6\u0398\u03A9\u03B4\u221E\u03C6\u03B5\u2229\u2261\xB1\u2265\u2264\u2320\u2321\xF7\u2248\xB0\u2219\xB7\u221A\u207F\xB2\u25A0 ",
  cp858: "\xC7\xFC\xE9\xE2\xE4\xE0\xE5\xE7\xEA\xEB\xE8\xEF\xEE\xEC\xC4\xC5\xC9\xE6\xC6\xF4\xF6\xF2\xFB\xF9\xFF\xD6\xDC\xF8\xA3\xD8\xD7\u0192\xE1\xED\xF3\xFA\xF1\xD1\xAA\xBA\xBF\xAE\xAC\xBD\xBC\xA1\xAB\xBB\u2591\u2592\u2593\u2502\u2524\xC1\xC2\xC0\xA9\u2563\u2551\u2557\u255D\xA2\xA5\u2510\u2514\u2534\u252C\u251C\u2500\u253C\xE3\xC3\u255A\u2554\u2569\u2566\u2560\u2550\u256C\xA4\xF0\xD0\xCA\xCB\xC8\u20AC\xCD\xCE\xCF\u2518\u250C\u2588\u2584\xA6\xCC\u2580\xD3\xDF\xD4\xD2\xF5\xD5\xB5\xFE\xDE\xDA\xDB\xD9\xFD\xDD\xAF\xB4\xAD\xB1\u2017\xBE\xB6\xA7\xF7\xB8\xB0\xA8\xB7\xB9\xB3\xB2\u25A0 "
};
CHARMAPS.cp858 = CHARMAPS.cp437.slice(0, 128) + CHARMAPS.cp858;
CHARMAPS.ascii = CHARMAPS.cp437.split("").map((c, i2) => i2 > 31 && i2 < 128 ? c : ".").join("");

// ../prototipo-contenedores-web/kubernetes-real/motor-experimento/fuentes-jit8192/src/log.js
if (false) {
  globalThis.DEBUG = true;
}
var LOG_TO_FILE = false;
var LOG_LEVEL = LOG_ALL & ~LOG_PS2 & ~LOG_PIT & ~LOG_VIRTIO & ~LOG_9P & ~LOG_PIC & ~LOG_DMA & ~LOG_SERIAL & ~LOG_NET & ~LOG_FLOPPY & ~LOG_DISK & ~LOG_VGA & ~LOG_SB16;
var log_data = [];
function do_the_log(message) {
  if (LOG_TO_FILE) {
    log_data.push(message, "\n");
  } else {
    console.log(message);
  }
}
var dbg_log = (function() {
  if (true) {
    return function() {
    };
  }
  const dbg_names = LOG_NAMES.reduce(function(a, x) {
    a[x[0]] = x[1];
    return a;
  }, {});
  var log_last_message = "";
  var log_message_repetitions = 0;
  function dbg_log_(stuff, level) {
    if (true) return;
    level = level || 1;
    if (level & LOG_LEVEL) {
      var level_name = dbg_names[level] || "", message = "[" + pads(level_name, 4) + "] " + stuff;
      if (message === log_last_message) {
        log_message_repetitions++;
        if (log_message_repetitions < 2048) {
          return;
        }
      }
      var now = /* @__PURE__ */ new Date();
      var time_str = pad0(now.getHours(), 2) + ":" + pad0(now.getMinutes(), 2) + ":" + pad0(now.getSeconds(), 2) + "+" + pad0(now.getMilliseconds(), 3) + " ";
      if (log_message_repetitions) {
        if (log_message_repetitions === 1) {
          do_the_log(time_str + log_last_message);
        } else {
          do_the_log("Previous message repeated " + log_message_repetitions + " times");
        }
        log_message_repetitions = 0;
      }
      do_the_log(time_str + message);
      log_last_message = message;
    }
  }
  return dbg_log_;
})();
function dbg_assert(cond, msg, level) {
  if (true) return;
  if (!cond) {
    dbg_assert_failed(msg);
  }
}
function dbg_assert_failed(msg) {
  debugger;
  console.trace();
  if (msg) {
    throw "Assert failed: " + msg;
  } else {
    throw "Assert failed";
  }
}

// ../prototipo-contenedores-web/kubernetes-real/motor-experimento/fuentes-jit8192/src/browser/fake_network.js
var ETHERTYPE_IPV4 = 2048;
var ETHERTYPE_ARP = 2054;
var ETHERTYPE_IPV6 = 34525;
var IPV4_PROTO_ICMP = 1;
var IPV4_PROTO_TCP = 6;
var IPV4_PROTO_UDP = 17;
var UNIX_EPOCH = (/* @__PURE__ */ new Date("1970-01-01T00:00:00Z")).getTime();
var NTP_EPOCH = (/* @__PURE__ */ new Date("1900-01-01T00:00:00Z")).getTime();
var NTP_EPOC_DIFF = UNIX_EPOCH - NTP_EPOCH;
var TWO_TO_32 = Math.pow(2, 32);
var DHCP_MAGIC_COOKIE = 1669485411;
var V86_ASCII = [118, 56, 54];
var TCP_STATE_CLOSED = "closed";
var TCP_STATE_SYN_RECEIVED = "syn-received";
var TCP_STATE_SYN_SENT = "syn-sent";
var TCP_STATE_SYN_PROBE = "syn-probe";
var TCP_STATE_ESTABLISHED = "established";
var TCP_STATE_FIN_WAIT_1 = "fin-wait-1";
var TCP_STATE_CLOSE_WAIT = "close-wait";
var TCP_STATE_FIN_WAIT_2 = "fin-wait-2";
var TCP_STATE_LAST_ACK = "last-ack";
var TCP_STATE_CLOSING = "closing";
var TCP_DYNAMIC_PORT_START = 49152;
var TCP_DYNAMIC_PORT_END = 65535;
var TCP_DYNAMIC_PORT_RANGE = TCP_DYNAMIC_PORT_END - TCP_DYNAMIC_PORT_START;
var ETH_HEADER_SIZE = 14;
var ETH_PAYLOAD_OFFSET = ETH_HEADER_SIZE;
var MTU_DEFAULT = 1500;
var ETH_TRAILER_SIZE = 4;
var IPV4_HEADER_SIZE = 20;
var IPV4_PAYLOAD_OFFSET = ETH_PAYLOAD_OFFSET + IPV4_HEADER_SIZE;
var UDP_HEADER_SIZE = 8;
var UDP_PAYLOAD_OFFSET = IPV4_PAYLOAD_OFFSET + UDP_HEADER_SIZE;
var TCP_HEADER_SIZE = 20;
var TCP_PAYLOAD_OFFSET = IPV4_PAYLOAD_OFFSET + TCP_HEADER_SIZE;
var ICMP_HEADER_SIZE = 4;
var DEFAULT_DOH_SERVER = "cloudflare-dns.com";
function a2ethaddr(bytes) {
  return [0, 1, 2, 3, 4, 5].map((i2) => bytes[i2].toString(16)).map((x) => x.length === 1 ? "0" + x : x).join(":");
}
function iptolong(parts) {
  return parts[0] << 24 | parts[1] << 16 | parts[2] << 8 | parts[3];
}
var GrowableRingbuffer = class {
  /**
   * @param {number} initial_capacity
   * @param {number} maximum_capacity
   */
  constructor(initial_capacity, maximum_capacity) {
    initial_capacity = Math.min(initial_capacity, 16);
    this.maximum_capacity = maximum_capacity ? Math.max(maximum_capacity, initial_capacity) : 0;
    this.tail = 0;
    this.head = 0;
    this.length = 0;
    this.buffer = new Uint8Array(initial_capacity);
  }
  /**
   * @param {Uint8Array} src_array
   */
  write(src_array) {
    const src_length = src_array.length;
    const total_length = this.length + src_length;
    let capacity = this.buffer.length;
    if (capacity < total_length) {
      dbg_assert(capacity > 0);
      while (capacity < total_length) {
        capacity *= 2;
      }
      if (this.maximum_capacity && capacity > this.maximum_capacity) {
        throw new Error("stream capacity overflow in GrowableRingbuffer.write(), package dropped");
      }
      const new_buffer = new Uint8Array(capacity);
      this.peek(new_buffer);
      this.tail = 0;
      this.head = this.length;
      this.buffer = new_buffer;
    }
    const buffer = this.buffer;
    const new_head = this.head + src_length;
    if (new_head > capacity) {
      const i_split = capacity - this.head;
      buffer.set(src_array.subarray(0, i_split), this.head);
      buffer.set(src_array.subarray(i_split));
    } else {
      buffer.set(src_array, this.head);
    }
    this.head = new_head % capacity;
    this.length += src_length;
  }
  /**
   * @param {Uint8Array} dst_array
   */
  peek(dst_array) {
    const length = Math.min(this.length, dst_array.length);
    if (length) {
      const buffer = this.buffer;
      const capacity = buffer.length;
      const new_tail = this.tail + length;
      if (new_tail > capacity) {
        const buf_len_left = new_tail % capacity;
        const buf_len_right = capacity - this.tail;
        dst_array.set(buffer.subarray(this.tail));
        dst_array.set(buffer.subarray(0, buf_len_left), buf_len_right);
      } else {
        dst_array.set(buffer.subarray(this.tail, new_tail));
      }
    }
    return length;
  }
  /**
   * @param {number} length
   */
  remove(length) {
    if (length > this.length) {
      length = this.length;
    }
    if (length) {
      this.tail = (this.tail + length) % this.buffer.length;
      this.length -= length;
    }
    return length;
  }
};
function create_eth_encoder_buf(mtu = MTU_DEFAULT) {
  const ETH_FRAME_SIZE = ETH_HEADER_SIZE + mtu + ETH_TRAILER_SIZE;
  const IPV4_PAYLOAD_SIZE = mtu - IPV4_HEADER_SIZE;
  const UDP_PAYLOAD_SIZE = IPV4_PAYLOAD_SIZE - UDP_HEADER_SIZE;
  const eth_frame = new Uint8Array(ETH_FRAME_SIZE);
  const buffer = eth_frame.buffer;
  const offset = eth_frame.byteOffset;
  return {
    eth_frame,
    eth_frame_view: new DataView(buffer),
    eth_payload_view: new DataView(buffer, offset + ETH_PAYLOAD_OFFSET, mtu),
    ipv4_payload_view: new DataView(buffer, offset + IPV4_PAYLOAD_OFFSET, IPV4_PAYLOAD_SIZE),
    udp_payload_view: new DataView(buffer, offset + UDP_PAYLOAD_OFFSET, UDP_PAYLOAD_SIZE),
    text_encoder: new TextEncoder()
  };
}
function view_set_array(offset, data, view, out) {
  out.eth_frame.set(data, view.byteOffset + offset);
  return data.length;
}
function view_set_zeros(offset, length, view, out) {
  out.eth_frame.fill(0, view.byteOffset + offset, view.byteOffset + offset + length);
}
function view_set_string(offset, str, view, out) {
  return out.text_encoder.encodeInto(str, out.eth_frame.subarray(view.byteOffset + offset)).written;
}
function calc_inet_checksum(length, checksum, view, out) {
  const uint16_end = view.byteOffset + (length & ~1);
  const eth_frame = out.eth_frame;
  for (let i2 = view.byteOffset; i2 < uint16_end; i2 += 2) {
    checksum += eth_frame[i2] << 8 | eth_frame[i2 + 1];
  }
  if (length & 1) {
    checksum += eth_frame[uint16_end] << 8;
  }
  while (checksum >>> 16) {
    checksum = (checksum & 65535) + (checksum >>> 16);
  }
  return ~checksum & 65535;
}
function make_packet(out, spec) {
  dbg_assert(spec.eth);
  out.eth_frame.fill(0);
  return out.eth_frame.subarray(0, write_eth(spec, out));
}
function handle_fake_tcp(packet, adapter) {
  const tuple = `${packet.ipv4.src.join(".")}:${packet.tcp.sport}:${packet.ipv4.dest.join(".")}:${packet.tcp.dport}`;
  if (packet.tcp.syn && !packet.tcp.ack) {
    if (adapter.tcp_conn[tuple]) {
      dbg_log("SYN to already opened port", LOG_FETCH);
      delete adapter.tcp_conn[tuple];
    }
    let conn = new TCPConnection(adapter);
    conn.state = TCP_STATE_SYN_RECEIVED;
    conn.tuple = tuple;
    conn.last = packet;
    conn.hsrc = new Uint8Array(packet.eth.dest);
    conn.psrc = new Uint8Array(packet.ipv4.dest);
    conn.sport = packet.tcp.dport;
    conn.hdest = new Uint8Array(packet.eth.src);
    conn.dport = packet.tcp.sport;
    conn.pdest = new Uint8Array(packet.ipv4.src);
    adapter.bus.pair.send("tcp-connection", conn);
    if (adapter.on_tcp_connection) {
      adapter.on_tcp_connection(conn, packet);
    }
    if (adapter.tcp_conn[tuple]) return;
  }
  if (!adapter.tcp_conn[tuple]) {
    dbg_log(`I dont know about ${tuple}, so resetting`, LOG_FETCH);
    let bop = packet.tcp.ackn;
    if (packet.tcp.fin || packet.tcp.syn) bop += 1;
    let reply = {};
    reply.eth = { ethertype: ETHERTYPE_IPV4, src: adapter.router_mac, dest: packet.eth.src };
    reply.ipv4 = {
      proto: IPV4_PROTO_TCP,
      src: packet.ipv4.dest,
      dest: packet.ipv4.src
    };
    reply.tcp = {
      sport: packet.tcp.dport,
      dport: packet.tcp.sport,
      seq: bop,
      ackn: packet.tcp.seq + (packet.tcp.syn ? 1 : 0),
      winsize: packet.tcp.winsize,
      rst: true,
      ack: packet.tcp.syn
    };
    adapter.receive(make_packet(adapter.eth_encoder_buf, reply));
    return true;
  }
  adapter.tcp_conn[tuple].process(packet);
}
function handle_fake_dns_static(packet, adapter) {
  let reply = {};
  reply.eth = { ethertype: ETHERTYPE_IPV4, src: adapter.router_mac, dest: packet.eth.src };
  reply.ipv4 = {
    proto: IPV4_PROTO_UDP,
    src: adapter.router_ip,
    dest: packet.ipv4.src
  };
  reply.udp = { sport: 53, dport: packet.udp.sport };
  let answers = [];
  let flags = 32768;
  flags |= 384;
  for (let i2 = 0; i2 < packet.dns.questions.length; ++i2) {
    let q = packet.dns.questions[i2];
    switch (q.type) {
      case 1:
        answers.push({
          name: q.name,
          type: q.type,
          class: q.class,
          ttl: 600,
          data: [192, 168, 87, 1]
        });
        break;
      default:
    }
  }
  reply.dns = {
    id: packet.dns.id,
    flags,
    questions: packet.dns.questions,
    answers
  };
  adapter.receive(make_packet(adapter.eth_encoder_buf, reply));
  return true;
}
function handle_fake_dns_doh(packet, adapter) {
  const fetch_url = `https://${adapter.doh_server || DEFAULT_DOH_SERVER}/dns-query`;
  const fetch_opts = {
    method: "POST",
    headers: [["content-type", "application/dns-message"]],
    body: packet.udp.data
  };
  fetch(fetch_url, fetch_opts).then(async (resp) => {
    const reply = {
      eth: {
        ethertype: ETHERTYPE_IPV4,
        src: adapter.router_mac,
        dest: packet.eth.src
      },
      ipv4: {
        proto: IPV4_PROTO_UDP,
        src: adapter.router_ip,
        dest: packet.ipv4.src
      },
      udp: {
        sport: 53,
        dport: packet.udp.sport,
        data: new Uint8Array(await resp.arrayBuffer())
      }
    };
    adapter.receive(make_packet(adapter.eth_encoder_buf, reply));
  });
  return true;
}
function handle_fake_dns(packet, adapter) {
  if (adapter.dns_method === "static") {
    return handle_fake_dns_static(packet, adapter);
  } else {
    return handle_fake_dns_doh(packet, adapter);
  }
}
function handle_fake_ntp(packet, adapter) {
  let now = Date.now();
  let now_n = now + NTP_EPOC_DIFF;
  let now_n_f = TWO_TO_32 * (now_n % 1e3 / 1e3);
  let reply = {};
  reply.eth = { ethertype: ETHERTYPE_IPV4, src: adapter.router_mac, dest: packet.eth.src };
  reply.ipv4 = {
    proto: IPV4_PROTO_UDP,
    src: packet.ipv4.dest,
    dest: packet.ipv4.src
  };
  reply.udp = { sport: 123, dport: packet.udp.sport };
  let flags = 0 << 6 | 4 << 3 | 4;
  reply.ntp = Object.assign({}, packet.ntp);
  reply.ntp.flags = flags;
  reply.ntp.poll = 10;
  reply.ntp.ori_ts_i = packet.ntp.trans_ts_i;
  reply.ntp.ori_ts_f = packet.ntp.trans_ts_f;
  reply.ntp.rec_ts_i = now_n / 1e3;
  reply.ntp.rec_ts_f = now_n_f;
  reply.ntp.trans_ts_i = now_n / 1e3;
  reply.ntp.trans_ts_f = now_n_f;
  reply.ntp.stratum = 2;
  adapter.receive(make_packet(adapter.eth_encoder_buf, reply));
  return true;
}
function handle_fake_dhcp(packet, adapter) {
  let reply = {};
  reply.eth = { ethertype: ETHERTYPE_IPV4, src: adapter.router_mac, dest: packet.eth.src };
  reply.ipv4 = {
    proto: IPV4_PROTO_UDP,
    src: adapter.router_ip,
    dest: adapter.vm_ip
  };
  reply.udp = { sport: 67, dport: 68 };
  reply.dhcp = {
    htype: 1,
    hlen: 6,
    hops: 0,
    xid: packet.dhcp.xid,
    secs: 0,
    flags: 0,
    ciaddr: 0,
    yiaddr: iptolong(adapter.vm_ip),
    siaddr: iptolong(adapter.router_ip),
    giaddr: iptolong(adapter.router_ip),
    chaddr: packet.dhcp.chaddr
  };
  let options = [];
  let fix = packet.dhcp.options.find(function(x) {
    return x[0] === 53;
  });
  if (fix && fix[2] === 3) packet.dhcp.op = 3;
  if (packet.dhcp.op === 1) {
    reply.dhcp.op = 2;
    options.push(new Uint8Array([53, 1, 2]));
  }
  if (packet.dhcp.op === 3) {
    reply.dhcp.op = 2;
    options.push(new Uint8Array([53, 1, 5]));
    options.push(new Uint8Array([51, 4, 8, 0, 0, 0]));
  }
  let router_ip = [adapter.router_ip[0], adapter.router_ip[1], adapter.router_ip[2], adapter.router_ip[3]];
  options.push(new Uint8Array([1, 4, 255, 255, 255, 0]));
  if (adapter.masquerade) {
    options.push(new Uint8Array([3, 4].concat(router_ip)));
    options.push(new Uint8Array([6, 4].concat(router_ip)));
  }
  options.push(new Uint8Array([54, 4].concat(router_ip)));
  options.push(new Uint8Array([60, 3].concat(V86_ASCII)));
  options.push(new Uint8Array([255, 0]));
  reply.dhcp.options = options;
  adapter.receive(make_packet(adapter.eth_encoder_buf, reply));
}
function handle_fake_networking(data, adapter) {
  let packet = {};
  parse_eth(data, packet);
  if (packet.ipv4) {
    if (packet.tcp) {
      handle_fake_tcp(packet, adapter);
    } else if (packet.udp) {
      if (packet.dns) {
        handle_fake_dns(packet, adapter);
      } else if (packet.dhcp) {
        handle_fake_dhcp(packet, adapter);
      } else if (packet.ntp) {
        handle_fake_ntp(packet, adapter);
      } else if (packet.udp.dport === 8) {
        handle_udp_echo(packet, adapter);
      }
    } else if (packet.icmp && packet.icmp.type === 8) {
      handle_fake_ping(packet, adapter);
    }
  } else if (packet.arp && packet.arp.oper === 1 && packet.arp.ptype === ETHERTYPE_IPV4) {
    arp_whohas(packet, adapter);
  }
}
function parse_eth(data, o) {
  let view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  let ethertype = view.getUint16(12);
  let eth = {
    ethertype,
    dest: data.subarray(0, 6),
    dest_s: a2ethaddr(data.subarray(0, 6)),
    src: data.subarray(6, 12),
    src_s: a2ethaddr(data.subarray(6, 12))
  };
  o.eth = eth;
  let payload = data.subarray(ETH_HEADER_SIZE, data.length);
  if (ethertype === ETHERTYPE_IPV4) {
    parse_ipv4(payload, o);
  } else if (ethertype === ETHERTYPE_ARP) {
    parse_arp(payload, o);
  } else if (ethertype === ETHERTYPE_IPV6) {
    dbg_log("Unimplemented: ipv6");
  } else {
    dbg_log("Unknown ethertype: " + h(ethertype), LOG_FETCH);
  }
}
function write_eth(spec, out) {
  const view = out.eth_frame_view;
  view_set_array(0, spec.eth.dest, view, out);
  view_set_array(6, spec.eth.src, view, out);
  view.setUint16(12, spec.eth.ethertype);
  let len = ETH_HEADER_SIZE;
  if (spec.arp) {
    len += write_arp(spec, out);
  } else if (spec.ipv4) {
    len += write_ipv4(spec, out);
  }
  return len;
}
function parse_arp(data, o) {
  let view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  let hlen = data[4];
  let plen = data[5];
  let arp = {
    htype: view.getUint16(0),
    ptype: view.getUint16(2),
    oper: view.getUint16(6),
    sha: data.subarray(8, 14),
    spa: data.subarray(14, 18),
    tha: data.subarray(18, 24),
    tpa: data.subarray(24, 28)
  };
  o.arp = arp;
}
function write_arp(spec, out) {
  const view = out.eth_payload_view;
  view.setUint16(0, spec.arp.htype);
  view.setUint16(2, spec.arp.ptype);
  view.setUint8(4, spec.arp.sha.length);
  view.setUint8(5, spec.arp.spa.length);
  view.setUint16(6, spec.arp.oper);
  view_set_array(8, spec.arp.sha, view, out);
  view_set_array(14, spec.arp.spa, view, out);
  view_set_array(18, spec.arp.tha, view, out);
  view_set_array(24, spec.arp.tpa, view, out);
  return 28;
}
function parse_ipv4(data, o) {
  let view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  let version = data[0] >> 4 & 15;
  let ihl = data[0] & 15;
  let tos = view.getUint8(1);
  let len = view.getUint16(2);
  let ttl = view.getUint8(8);
  let proto = view.getUint8(9);
  let ip_checksum = view.getUint16(10);
  let ipv4 = {
    version,
    ihl,
    tos,
    len,
    ttl,
    proto,
    ip_checksum,
    src: data.subarray(12, 12 + 4),
    dest: data.subarray(16, 16 + 4)
  };
  if (Math.max(len, 46) !== data.length) {
    dbg_log(`ipv4 Length mismatch: ${len} != ${data.length}`, LOG_FETCH);
  }
  o.ipv4 = ipv4;
  let ipdata = data.subarray(ihl * 4, len);
  if (proto === IPV4_PROTO_ICMP) {
    parse_icmp(ipdata, o);
  } else if (proto === IPV4_PROTO_TCP) {
    parse_tcp(ipdata, o);
  } else if (proto === IPV4_PROTO_UDP) {
    parse_udp(ipdata, o);
  }
}
function write_ipv4(spec, out) {
  const view = out.eth_payload_view;
  const ihl = IPV4_HEADER_SIZE >> 2;
  const version = 4;
  let len = IPV4_HEADER_SIZE;
  if (spec.icmp) {
    len += write_icmp(spec, out);
  } else if (spec.udp) {
    len += write_udp(spec, out);
  } else if (spec.tcp) {
    len += write_tcp(spec, out);
  }
  view.setUint8(0, version << 4 | ihl & 15);
  view.setUint8(1, spec.ipv4.tos || 0);
  view.setUint16(2, len);
  view.setUint16(4, spec.ipv4.id || 0);
  view.setUint8(6, 2 << 5);
  view.setUint8(8, spec.ipv4.ttl || 32);
  view.setUint8(9, spec.ipv4.proto);
  view.setUint16(10, 0);
  view_set_array(12, spec.ipv4.src, view, out);
  view_set_array(16, spec.ipv4.dest, view, out);
  view.setUint16(10, calc_inet_checksum(IPV4_HEADER_SIZE, 0, view, out));
  return len;
}
function parse_icmp(data, o) {
  let view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  let icmp = {
    type: view.getUint8(0),
    code: view.getUint8(1),
    checksum: view.getUint16(2),
    data: data.subarray(4)
  };
  o.icmp = icmp;
}
function write_icmp(spec, out) {
  const view = out.ipv4_payload_view;
  view.setUint8(0, spec.icmp.type);
  view.setUint8(1, spec.icmp.code);
  view.setUint16(2, 0);
  const data_length = view_set_array(ICMP_HEADER_SIZE, spec.icmp.data, view, out);
  const total_length = ICMP_HEADER_SIZE + data_length;
  view.setUint16(2, calc_inet_checksum(total_length, 0, view, out));
  return total_length;
}
function parse_udp(data, o) {
  let view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  let udp = {
    sport: view.getUint16(0),
    dport: view.getUint16(2),
    len: view.getUint16(4),
    checksum: view.getUint16(6),
    data: data.subarray(8),
    data_s: new TextDecoder().decode(data.subarray(8))
  };
  if (udp.dport === 67 || udp.sport === 67) {
    parse_dhcp(data.subarray(8), o);
  } else if (udp.dport === 53 || udp.sport === 53) {
    parse_dns(data.subarray(8), o);
  } else if (udp.dport === 123) {
    parse_ntp(data.subarray(8), o);
  }
  o.udp = udp;
}
function write_udp(spec, out) {
  const view = out.ipv4_payload_view;
  let total_length = UDP_HEADER_SIZE;
  if (spec.dhcp) {
    total_length += write_dhcp(spec, out);
  } else if (spec.dns) {
    total_length += write_dns(spec, out);
  } else if (spec.ntp) {
    total_length += write_ntp(spec, out);
  } else {
    total_length += view_set_array(0, spec.udp.data, out.udp_payload_view, out);
  }
  view.setUint16(0, spec.udp.sport);
  view.setUint16(2, spec.udp.dport);
  view.setUint16(4, total_length);
  view.setUint16(6, 0);
  const pseudo_header = (spec.ipv4.src[0] << 8 | spec.ipv4.src[1]) + (spec.ipv4.src[2] << 8 | spec.ipv4.src[3]) + (spec.ipv4.dest[0] << 8 | spec.ipv4.dest[1]) + (spec.ipv4.dest[2] << 8 | spec.ipv4.dest[3]) + IPV4_PROTO_UDP + total_length;
  view.setUint16(6, calc_inet_checksum(total_length, pseudo_header, view, out));
  return total_length;
}
function parse_dns(data, o) {
  let view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  let dns = {
    id: view.getUint16(0),
    flags: view.getUint16(2),
    questions: [],
    answers: []
  };
  let qdcount = view.getUint16(4);
  let ancount = view.getUint16(6);
  let nscount = view.getUint16(8);
  let arcount = view.getUint16(10);
  let offset = 12;
  function read_dstr() {
    let o2 = [];
    let len;
    do {
      len = view.getUint8(offset);
      o2.push(new TextDecoder().decode(data.subarray(offset + 1, offset + 1 + len)));
      offset += len + 1;
    } while (len > 0);
    return o2;
  }
  for (let i2 = 0; i2 < qdcount; i2++) {
    dns.questions.push({
      name: read_dstr(),
      type: view.getInt16(offset),
      class: view.getInt16(offset + 2)
    });
    offset += 4;
  }
  for (let i2 = 0; i2 < ancount; i2++) {
    let ans = {
      name: read_dstr(),
      type: view.getInt16(offset),
      class: view.getUint16(offset + 2),
      ttl: view.getUint32(offset + 4)
    };
    offset += 8;
    let rdlen = view.getUint16(offset);
    offset += 2;
    ans.data = data.subarray(offset, offset + rdlen);
    offset += rdlen;
    dns.answers.push(ans);
  }
  o.dns = dns;
}
function write_dns(spec, out) {
  const view = out.udp_payload_view;
  view.setUint16(0, spec.dns.id);
  view.setUint16(2, spec.dns.flags);
  view.setUint16(4, spec.dns.questions.length);
  view.setUint16(6, spec.dns.answers.length);
  let offset = 12;
  for (let i2 = 0; i2 < spec.dns.questions.length; ++i2) {
    let q = spec.dns.questions[i2];
    for (let s of q.name) {
      const n_written = view_set_string(offset + 1, s, view, out);
      view.setUint8(offset, n_written);
      offset += 1 + n_written;
    }
    view.setUint16(offset, q.type);
    offset += 2;
    view.setUint16(offset, q.class);
    offset += 2;
  }
  function write_reply(a) {
    for (let s of a.name) {
      const n_written = view_set_string(offset + 1, s, view, out);
      view.setUint8(offset, n_written);
      offset += 1 + n_written;
    }
    view.setUint16(offset, a.type);
    offset += 2;
    view.setUint16(offset, a.class);
    offset += 2;
    view.setUint32(offset, a.ttl);
    offset += 4;
    view.setUint16(offset, a.data.length);
    offset += 2;
    offset += view_set_array(offset, a.data, view, out);
  }
  for (let i2 = 0; i2 < spec.dns.answers.length; ++i2) {
    let a = spec.dns.answers[i2];
    write_reply(a);
  }
  return offset;
}
function parse_dhcp(data, o) {
  let view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  let bootpo = data.subarray(44, 44 + 192);
  let dhcp = {
    op: view.getUint8(0),
    htype: view.getUint8(1),
    hlen: view.getUint8(2),
    hops: view.getUint8(3),
    xid: view.getUint32(4),
    secs: view.getUint16(8),
    flags: view.getUint16(10),
    ciaddr: view.getUint32(12),
    yiaddr: view.getUint32(16),
    siaddr: view.getUint32(20),
    giaddr: view.getUint32(24),
    chaddr: data.subarray(28, 28 + 16),
    magic: view.getUint32(236),
    options: []
  };
  let options = data.subarray(240);
  for (let i2 = 0; i2 < options.length; ++i2) {
    let start = i2;
    let op = options[i2];
    if (op === 0) continue;
    ++i2;
    let len = options[i2];
    i2 += len;
    dhcp.options.push(options.subarray(start, start + len + 2));
  }
  o.dhcp = dhcp;
  o.dhcp_options = dhcp.options;
}
function write_dhcp(spec, out) {
  const view = out.udp_payload_view;
  view.setUint8(0, spec.dhcp.op);
  view.setUint8(1, spec.dhcp.htype);
  view.setUint8(2, spec.dhcp.hlen);
  view.setUint8(3, spec.dhcp.hops);
  view.setUint32(4, spec.dhcp.xid);
  view.setUint16(8, spec.dhcp.secs);
  view.setUint16(10, spec.dhcp.flags);
  view.setUint32(12, spec.dhcp.ciaddr);
  view.setUint32(16, spec.dhcp.yiaddr);
  view.setUint32(20, spec.dhcp.siaddr);
  view.setUint32(24, spec.dhcp.giaddr);
  view_set_array(28, spec.dhcp.chaddr, view, out);
  view.setUint32(236, DHCP_MAGIC_COOKIE);
  let offset = 240;
  for (let o of spec.dhcp.options) {
    offset += view_set_array(offset, o, view, out);
  }
  return offset;
}
function parse_ntp(data, o) {
  let view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  o.ntp = {
    flags: view.getUint8(0),
    stratum: view.getUint8(1),
    poll: view.getUint8(2),
    precision: view.getUint8(3),
    root_delay: view.getUint32(4),
    root_disp: view.getUint32(8),
    ref_id: view.getUint32(12),
    ref_ts_i: view.getUint32(16),
    ref_ts_f: view.getUint32(20),
    ori_ts_i: view.getUint32(24),
    ori_ts_f: view.getUint32(28),
    rec_ts_i: view.getUint32(32),
    rec_ts_f: view.getUint32(36),
    trans_ts_i: view.getUint32(40),
    trans_ts_f: view.getUint32(44)
  };
}
function write_ntp(spec, out) {
  const view = out.udp_payload_view;
  view.setUint8(0, spec.ntp.flags);
  view.setUint8(1, spec.ntp.stratum);
  view.setUint8(2, spec.ntp.poll);
  view.setUint8(3, spec.ntp.precision);
  view.setUint32(4, spec.ntp.root_delay);
  view.setUint32(8, spec.ntp.root_disp);
  view.setUint32(12, spec.ntp.ref_id);
  view.setUint32(16, spec.ntp.ref_ts_i);
  view.setUint32(20, spec.ntp.ref_ts_f);
  view.setUint32(24, spec.ntp.ori_ts_i);
  view.setUint32(28, spec.ntp.ori_ts_f);
  view.setUint32(32, spec.ntp.rec_ts_i);
  view.setUint32(36, spec.ntp.rec_ts_f);
  view.setUint32(40, spec.ntp.trans_ts_i);
  view.setUint32(44, spec.ntp.trans_ts_f);
  return 48;
}
function parse_tcp(data, o) {
  let view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  let tcp = {
    sport: view.getUint16(0),
    dport: view.getUint16(2),
    seq: view.getUint32(4),
    ackn: view.getUint32(8),
    doff: view.getUint8(12) >> 4,
    winsize: view.getUint16(14),
    checksum: view.getUint16(16),
    urgent: view.getUint16(18)
  };
  let flags = view.getUint8(13);
  tcp.fin = !!(flags & 1);
  tcp.syn = !!(flags & 2);
  tcp.rst = !!(flags & 4);
  tcp.psh = !!(flags & 8);
  tcp.ack = !!(flags & 16);
  tcp.urg = !!(flags & 32);
  tcp.ece = !!(flags & 64);
  tcp.cwr = !!(flags & 128);
  o.tcp = tcp;
  let offset = tcp.doff * 4;
  o.tcp_data = data.subarray(offset);
}
function write_tcp(spec, out) {
  const view = out.ipv4_payload_view;
  let flags = 0;
  let tcp = spec.tcp;
  if (tcp.fin) flags |= 1;
  if (tcp.syn) flags |= 2;
  if (tcp.rst) flags |= 4;
  if (tcp.psh) flags |= 8;
  if (tcp.ack) flags |= 16;
  if (tcp.urg) flags |= 32;
  if (tcp.ece) flags |= 64;
  if (tcp.cwr) flags |= 128;
  let doff = TCP_HEADER_SIZE;
  if (tcp.options) {
    if (tcp.options.mss) {
      view.setUint8(doff, 2);
      view.setUint8(doff + 1, 4);
      view.setUint16(doff + 2, tcp.options.mss);
      doff += 4;
    }
  }
  let total_length = Math.ceil(doff / 4) * 4;
  if (tcp.options && total_length - doff > 0) {
    view_set_zeros(doff, total_length - doff, view, out);
  }
  view.setUint16(0, tcp.sport);
  view.setUint16(2, tcp.dport);
  view.setUint32(4, tcp.seq);
  view.setUint32(8, tcp.ackn);
  view.setUint8(12, total_length >> 2 << 4);
  view.setUint8(13, flags);
  view.setUint16(14, tcp.winsize);
  view.setUint16(16, 0);
  view.setUint16(18, tcp.urgent || 0);
  if (spec.tcp_data) {
    total_length += view_set_array(TCP_HEADER_SIZE, spec.tcp_data, view, out);
  }
  const pseudo_header = (spec.ipv4.src[0] << 8 | spec.ipv4.src[1]) + (spec.ipv4.src[2] << 8 | spec.ipv4.src[3]) + (spec.ipv4.dest[0] << 8 | spec.ipv4.dest[1]) + (spec.ipv4.dest[2] << 8 | spec.ipv4.dest[3]) + IPV4_PROTO_TCP + total_length;
  view.setUint16(16, calc_inet_checksum(total_length, pseudo_header, view, out));
  return total_length;
}
function fake_tcp_connect(dport, adapter) {
  const vm_ip_str = adapter.vm_ip.join(".");
  const router_ip_str = adapter.router_ip.join(".");
  const sport_0 = Math.random() * TCP_DYNAMIC_PORT_RANGE | 0;
  let sport, tuple, sport_i = 0;
  do {
    sport = TCP_DYNAMIC_PORT_START + (sport_0 + sport_i) % TCP_DYNAMIC_PORT_RANGE;
    tuple = `${vm_ip_str}:${dport}:${router_ip_str}:${sport}`;
  } while (++sport_i < TCP_DYNAMIC_PORT_RANGE && adapter.tcp_conn[tuple]);
  if (adapter.tcp_conn[tuple]) {
    throw new Error("pool of dynamic TCP port numbers exhausted, connection aborted");
  }
  let conn = new TCPConnection(adapter);
  conn.tuple = tuple;
  conn.hsrc = adapter.router_mac;
  conn.psrc = adapter.router_ip;
  conn.sport = sport;
  conn.hdest = adapter.vm_mac;
  conn.dport = dport;
  conn.pdest = adapter.vm_ip;
  adapter.tcp_conn[tuple] = conn;
  conn.connect();
  return conn;
}
function fake_tcp_probe(dport, adapter) {
  return new Promise((res, rej) => {
    let handle = fake_tcp_connect(dport, adapter);
    handle.state = TCP_STATE_SYN_PROBE;
    handle.on("probe", res);
  });
}
function TCPConnection(adapter) {
  this.mtu = adapter.mtu || MTU_DEFAULT;
  const IPV4_PAYLOAD_SIZE = this.mtu - IPV4_HEADER_SIZE;
  const TCP_PAYLOAD_SIZE = IPV4_PAYLOAD_SIZE - TCP_HEADER_SIZE;
  this.state = TCP_STATE_CLOSED;
  this.net = adapter;
  this.send_buffer = new GrowableRingbuffer(2048, 0);
  this.send_chunk_buf = new Uint8Array(TCP_PAYLOAD_SIZE);
  this.in_active_close = false;
  this.delayed_send_fin = false;
  this.delayed_state = void 0;
  this.events_handlers = {};
}
TCPConnection.prototype.on = function(event, handler) {
  this.events_handlers[event] = handler;
};
TCPConnection.prototype.emit = function(event, ...args) {
  if (!this.events_handlers[event]) return;
  this.events_handlers[event].apply(this, args);
};
TCPConnection.prototype.ipv4_reply = function() {
  let reply = {};
  reply.eth = { ethertype: ETHERTYPE_IPV4, src: this.hsrc, dest: this.hdest };
  reply.ipv4 = {
    proto: IPV4_PROTO_TCP,
    src: this.psrc,
    dest: this.pdest
  };
  reply.tcp = {
    sport: this.sport,
    dport: this.dport,
    winsize: this.winsize,
    ackn: this.ack,
    seq: this.seq,
    ack: true
  };
  return reply;
};
TCPConnection.prototype.packet_reply = function(packet, tcp_options) {
  const reply_tcp = {
    sport: packet.tcp.dport,
    dport: packet.tcp.sport,
    winsize: packet.tcp.winsize,
    ackn: this.ack,
    seq: this.seq
  };
  if (tcp_options) {
    for (const opt in tcp_options) {
      reply_tcp[opt] = tcp_options[opt];
    }
  }
  const reply = this.ipv4_reply();
  reply.tcp = reply_tcp;
  return reply;
};
TCPConnection.prototype.connect = function() {
  this.seq = 1338;
  this.ack = 1;
  this.start_seq = 0;
  this.winsize = 64240;
  if (this.state !== TCP_STATE_SYN_PROBE) {
    this.state = TCP_STATE_SYN_SENT;
  }
  let reply = this.ipv4_reply();
  reply.ipv4.id = 2345;
  reply.tcp = {
    sport: this.sport,
    dport: this.dport,
    seq: 1337,
    ackn: 0,
    winsize: 0,
    syn: true
  };
  this.net.receive(make_packet(this.net.eth_encoder_buf, reply));
};
TCPConnection.prototype.accept = function(packet = void 0) {
  packet = packet || this.last;
  this.net.tcp_conn[this.tuple] = this;
  this.seq = 1338;
  this.ack = packet.tcp.seq + 1;
  this.start_seq = packet.tcp.seq;
  this.winsize = packet.tcp.winsize;
  let reply = this.ipv4_reply();
  reply.tcp = {
    sport: this.sport,
    dport: this.dport,
    seq: 1337,
    ackn: this.ack,
    winsize: packet.tcp.winsize,
    syn: true,
    ack: true,
    options: {
      mss: this.mtu - TCP_HEADER_SIZE - IPV4_HEADER_SIZE
    }
  };
  this.state = TCP_STATE_ESTABLISHED;
  this.net.receive(make_packet(this.net.eth_encoder_buf, reply));
};
TCPConnection.prototype.process = function(packet) {
  this.last = packet;
  if (this.state === TCP_STATE_CLOSED) {
    const reply = this.packet_reply(packet, { rst: true });
    this.net.receive(make_packet(this.net.eth_encoder_buf, reply));
    return;
  } else if (packet.tcp.rst) {
    if (this.state === TCP_STATE_SYN_PROBE) {
      this.emit("probe", false);
      this.release();
      return;
    }
    this.on_close();
    this.release();
    return;
  } else if (packet.tcp.syn) {
    if (this.state === TCP_STATE_SYN_SENT && packet.tcp.ack) {
      this.ack = packet.tcp.seq + 1;
      this.start_seq = packet.tcp.seq;
      this.last_received_ackn = packet.tcp.ackn;
      const reply = this.ipv4_reply();
      this.net.receive(make_packet(this.net.eth_encoder_buf, reply));
      this.state = TCP_STATE_ESTABLISHED;
      this.emit("connect");
    } else if (this.state === TCP_STATE_SYN_PROBE && packet.tcp.ack) {
      this.emit("probe", true);
      const reply = this.packet_reply(packet, { rst: true });
      this.net.receive(make_packet(this.net.eth_encoder_buf, reply));
      this.release();
    } else {
      dbg_log(`TCP[${this.tuple}]: WARNING: unexpected SYN packet dropped`, LOG_FETCH);
    }
    if (packet.tcp_data.length) {
      dbg_log(`TCP[${this.tuple}]: WARNING: ${packet.tcp_data.length} bytes of unexpected SYN packet payload dropped`, LOG_FETCH);
    }
    return;
  }
  if (packet.tcp.ack) {
    if (this.state === TCP_STATE_SYN_RECEIVED) {
      this.state = TCP_STATE_ESTABLISHED;
    } else if (this.state === TCP_STATE_FIN_WAIT_1) {
      if (!packet.tcp.fin) {
        this.state = TCP_STATE_FIN_WAIT_2;
      }
    } else if (this.state === TCP_STATE_CLOSING || this.state === TCP_STATE_LAST_ACK) {
      this.release();
      return;
    }
  }
  if (this.last_received_ackn === void 0) {
    this.last_received_ackn = packet.tcp.ackn;
  } else {
    const n_ack = packet.tcp.ackn - this.last_received_ackn;
    if (n_ack > 0) {
      this.last_received_ackn = packet.tcp.ackn;
      this.send_buffer.remove(n_ack);
      this.seq += n_ack;
      this.pending = false;
      if (this.delayed_send_fin && !this.send_buffer.length) {
        this.delayed_send_fin = false;
        this.state = this.delayed_state;
        const reply = this.ipv4_reply();
        reply.tcp.fin = true;
        this.net.receive(make_packet(this.net.eth_encoder_buf, reply));
        return;
      }
    } else if (n_ack < 0) {
      dbg_log(`TCP[${this.tuple}]: ERROR: ack underflow (pkt=${packet.tcp.ackn} last=${this.last_received_ackn}), resetting`, LOG_FETCH);
      const reply = this.packet_reply(packet, { rst: true });
      this.net.receive(make_packet(this.net.eth_encoder_buf, reply));
      this.on_close();
      this.release();
      return;
    }
  }
  if (packet.tcp.fin) {
    if (this.ack !== packet.tcp.seq) {
      dbg_log(`TCP[${this.tuple}]: WARNING: closing connection in state "${this.state}" with invalid seq (${this.ack} != ${packet.tcp.seq})`, LOG_FETCH);
    }
    ++this.ack;
    const reply = this.packet_reply(packet, {});
    if (this.state === TCP_STATE_ESTABLISHED) {
      reply.tcp.ack = true;
      this.state = TCP_STATE_CLOSE_WAIT;
      this.on_shutdown();
    } else if (this.state === TCP_STATE_FIN_WAIT_1) {
      if (packet.tcp.ack) {
        this.release();
      } else {
        this.state = TCP_STATE_CLOSING;
      }
      reply.tcp.ack = true;
    } else if (this.state === TCP_STATE_FIN_WAIT_2) {
      this.release();
      reply.tcp.ack = true;
    } else {
      this.release();
      this.on_close();
      reply.tcp.rst = true;
    }
    this.net.receive(make_packet(this.net.eth_encoder_buf, reply));
  } else if (this.ack !== packet.tcp.seq) {
    if (this.ack !== packet.tcp.seq + 1) {
      dbg_log(`Packet seq was wrong ex: ${this.ack} ~${this.ack - this.start_seq} pk: ${packet.tcp.seq} ~${this.start_seq - packet.tcp.seq} (${this.ack - packet.tcp.seq}) = ${this.name}`, LOG_FETCH);
    }
    const reply = this.packet_reply(packet, { ack: true });
    this.net.receive(make_packet(this.net.eth_encoder_buf, reply));
  } else if (packet.tcp.ack && packet.tcp_data.length > 0) {
    this.ack += packet.tcp_data.length;
    const reply = this.ipv4_reply();
    this.net.receive(make_packet(this.net.eth_encoder_buf, reply));
    this.emit("data", packet.tcp_data);
  }
  this.pump();
};
TCPConnection.prototype.write = function(data) {
  if (!this.in_active_close) {
    this.send_buffer.write(data);
  }
  this.pump();
};
TCPConnection.prototype.writev = function(data_array) {
  if (!this.in_active_close) {
    for (const data of data_array) {
      this.send_buffer.write(data);
    }
  }
  this.pump();
};
TCPConnection.prototype.close = function() {
  if (!this.in_active_close) {
    this.in_active_close = true;
    let next_state;
    if (this.state === TCP_STATE_ESTABLISHED || this.state === TCP_STATE_SYN_RECEIVED) {
      next_state = TCP_STATE_FIN_WAIT_1;
    } else if (this.state === TCP_STATE_CLOSE_WAIT) {
      next_state = TCP_STATE_LAST_ACK;
    } else {
      if (this.state !== TCP_STATE_SYN_SENT) {
        dbg_log(`TCP[${this.tuple}]: active close in unexpected state "${this.state}"`, LOG_FETCH);
      }
      this.release();
      return;
    }
    if (this.send_buffer.length || this.pending) {
      this.delayed_send_fin = true;
      this.delayed_state = next_state;
    } else {
      this.state = next_state;
      const reply = this.ipv4_reply();
      reply.tcp.fin = true;
      this.net.receive(make_packet(this.net.eth_encoder_buf, reply));
    }
  }
  this.pump();
};
TCPConnection.prototype.on_shutdown = function() {
  this.emit("shutdown");
};
TCPConnection.prototype.on_close = function() {
  this.emit("close");
};
TCPConnection.prototype.release = function() {
  if (this.net.tcp_conn[this.tuple]) {
    this.state = TCP_STATE_CLOSED;
    delete this.net.tcp_conn[this.tuple];
  }
};
TCPConnection.prototype.pump = function() {
  if (this.send_buffer.length && !this.pending) {
    const data = this.send_chunk_buf;
    const n_ready = this.send_buffer.peek(data);
    const reply = this.ipv4_reply();
    reply.tcp.psh = true;
    reply.tcp_data = data.subarray(0, n_ready);
    this.net.receive(make_packet(this.net.eth_encoder_buf, reply));
    this.pending = true;
  }
};
function arp_whohas(packet, adapter) {
  let packet_subnet = iptolong(packet.arp.tpa) & 4294967040;
  let router_subnet = iptolong(adapter.router_ip) & 4294967040;
  if (!adapter.masquerade) {
    if (packet_subnet !== router_subnet) {
      return;
    }
  }
  if (packet_subnet === router_subnet) {
    if (packet.arp.tpa[3] > 99) return;
  }
  let reply = {};
  reply.eth = { ethertype: ETHERTYPE_ARP, src: adapter.router_mac, dest: packet.eth.src };
  reply.arp = {
    htype: 1,
    ptype: ETHERTYPE_IPV4,
    oper: 2,
    sha: adapter.router_mac,
    spa: packet.arp.tpa,
    tha: packet.eth.src,
    tpa: packet.arp.spa
  };
  adapter.receive(make_packet(adapter.eth_encoder_buf, reply));
}
function handle_fake_ping(packet, adapter) {
  let reply = {};
  reply.eth = { ethertype: ETHERTYPE_IPV4, src: adapter.router_mac, dest: packet.eth.src };
  reply.ipv4 = {
    proto: IPV4_PROTO_ICMP,
    src: packet.ipv4.dest,
    dest: packet.ipv4.src
  };
  reply.icmp = {
    type: 0,
    code: packet.icmp.code,
    data: packet.icmp.data
  };
  adapter.receive(make_packet(adapter.eth_encoder_buf, reply));
}
function handle_udp_echo(packet, adapter) {
  let reply = {};
  reply.eth = { ethertype: ETHERTYPE_IPV4, src: adapter.router_mac, dest: packet.eth.src };
  reply.ipv4 = {
    proto: IPV4_PROTO_UDP,
    src: packet.ipv4.dest,
    dest: packet.ipv4.src
  };
  reply.udp = {
    sport: packet.udp.dport,
    dport: packet.udp.sport,
    data: new TextEncoder().encode(packet.udp.data_s)
  };
  adapter.receive(make_packet(adapter.eth_encoder_buf, reply));
}

// ../prototipo-contenedores-web/kubernetes-real/motor-experimento/fuentes-jit8192/src/bus.js
var Bus = {};
function BusConnector() {
  this.listeners = {};
  this.pair = void 0;
}
BusConnector.prototype.register = function(name, fn, this_value) {
  var listeners = this.listeners[name];
  if (listeners === void 0) {
    listeners = this.listeners[name] = [];
  }
  listeners.push({
    fn,
    this_value
  });
};
BusConnector.prototype.unregister = function(name, fn) {
  var listeners = this.listeners[name];
  if (listeners === void 0) {
    return;
  }
  this.listeners[name] = listeners.filter(function(l) {
    return l.fn !== fn;
  });
};
BusConnector.prototype.send = function(name, value, unused_transfer) {
  if (!this.pair) {
    return;
  }
  var listeners = this.pair.listeners[name];
  if (listeners === void 0) {
    return;
  }
  for (var i2 = 0; i2 < listeners.length; i2++) {
    var listener = listeners[i2];
    listener.fn.call(listener.this_value, value);
  }
};
BusConnector.prototype.send_async = function(name, value) {
  dbg_assert(arguments.length === 1 || arguments.length === 2);
  setTimeout(this.send.bind(this, name, value), 0);
};
Bus.create = function() {
  var c0 = new BusConnector();
  var c1 = new BusConnector();
  c0.pair = c1;
  c1.pair = c0;
  return [c0, c1];
};

// ../prototipo-contenedores-web/kubernetes-real/motor-experimento/fuentes-jit8192/src/browser/fetch_network.js
var CR = 13;
var LF = 10;
function find_crlfcrlf(haystack) {
  for (let i2 = 0; i2 + 3 < haystack.length; i2++) {
    if (haystack[i2] === CR && haystack[i2 + 1] === LF && haystack[i2 + 2] === CR && haystack[i2 + 3] === LF) {
      return i2;
    }
  }
  return -1;
}
function FetchNetworkAdapter(bus, config) {
  config = config || {};
  this.bus = bus;
  this.id = config.id || 0;
  this.router_mac = new Uint8Array((config.router_mac || "52:54:0:1:2:3").split(":").map(function(x) {
    return parseInt(x, 16);
  }));
  this.router_ip = new Uint8Array((config.router_ip || "192.168.86.1").split(".").map(function(x) {
    return parseInt(x, 10);
  }));
  this.vm_ip = new Uint8Array((config.vm_ip || "192.168.86.100").split(".").map(function(x) {
    return parseInt(x, 10);
  }));
  this.masquerade = config.masquerade === void 0 || !!config.masquerade;
  this.vm_mac = new Uint8Array(6);
  this.dns_method = config.dns_method || "static";
  this.doh_server = config.doh_server;
  this.tcp_conn = {};
  this.mtu = config.mtu;
  this.eth_encoder_buf = create_eth_encoder_buf(this.mtu);
  this.fetch = (...args) => fetch(...args);
  this.cors_proxy = config.cors_proxy;
  this.bus.register("net" + this.id + "-mac", function(mac) {
    this.vm_mac = new Uint8Array(mac.split(":").map(function(x) {
      return parseInt(x, 16);
    }));
  }, this);
  this.bus.register("net" + this.id + "-send", function(data) {
    this.send(data);
  }, this);
  this.bus.register("tcp-connection", (conn) => {
    if (conn.sport === 80) {
      conn.on("data", on_data_http);
      conn.accept();
    }
  }, this);
}
FetchNetworkAdapter.prototype.destroy = function() {
};
FetchNetworkAdapter.prototype.connect = function(port) {
  return fake_tcp_connect(port, this);
};
FetchNetworkAdapter.prototype.tcp_probe = function(port) {
  return fake_tcp_probe(port, this);
};
async function on_data_http(data) {
  if (this.pendingBody) {
    const chunk2 = data instanceof Uint8Array ? data : new Uint8Array(data);
    const combined = new Uint8Array(this.pendingBody.buf.length + chunk2.length);
    combined.set(this.pendingBody.buf);
    combined.set(chunk2, this.pendingBody.buf.length);
    this.pendingBody.buf = combined;
    if (this.pendingBody.buf.length >= this.pendingBody.cl) {
      const body = this.pendingBody.buf;
      const done = this.pendingBody.done;
      this.pendingBody = null;
      done(body);
    }
    return;
  }
  const chunk = data instanceof Uint8Array ? data : new Uint8Array(data);
  if (this.rawBuffer) {
    const combined = new Uint8Array(this.rawBuffer.length + chunk.length);
    combined.set(this.rawBuffer);
    combined.set(chunk, this.rawBuffer.length);
    this.rawBuffer = combined;
  } else {
    this.rawBuffer = chunk;
  }
  const sep_index = find_crlfcrlf(this.rawBuffer);
  if (sep_index === -1) return;
  const header_bytes = this.rawBuffer.slice(0, sep_index);
  const body_bytes = this.rawBuffer.slice(sep_index + 4);
  this.rawBuffer = null;
  const header_text = new TextDecoder().decode(header_bytes);
  const header_lines = header_text.split(/\r\n/);
  const first_line = header_lines[0].split(" ");
  let target;
  if (/^https?:/.test(first_line[1])) {
    target = new URL(first_line[1]);
  } else {
    target = new URL("http://host" + first_line[1]);
  }
  if (typeof window !== "undefined" && target.protocol === "http:" && window.location.protocol === "https:") {
    target.protocol = "https:";
  }
  const req_headers = new Headers();
  for (let i2 = 1; i2 < header_lines.length; ++i2) {
    const header = this.net.parse_http_header(header_lines[i2]);
    if (!header) {
      console.warn('The request contains an invalid header: "%s"', header_lines[i2]);
      this.net.respond_text_and_close(this, 400, "Bad Request", `Invalid header in request: ${header_lines[i2]}`);
      return;
    }
    if (header.key.toLowerCase() === "host") target.host = header.value;
    else req_headers.append(header.key, header.value);
  }
  if (!this.net.cors_proxy && /^\d+\.external$/.test(target.hostname)) {
    dbg_log("Request to localhost: " + target.href, LOG_FETCH);
    const localport = parseInt(target.hostname.split(".")[0], 10);
    if (!isNaN(localport) && localport > 0 && localport < 65536) {
      target.protocol = "http:";
      target.hostname = "localhost";
      target.port = localport.toString(10);
    } else {
      console.warn('Unknown port for localhost: "%s"', target.href);
      this.net.respond_text_and_close(this, 400, "Bad Request", `Unknown port for localhost: ${target.href}`);
      return;
    }
  }
  dbg_log("HTTP Dispatch: " + target.href, LOG_FETCH);
  this.name = target.href;
  const opts = {
    method: first_line[0],
    headers: req_headers
  };
  const fetch_url = this.net.cors_proxy ? this.net.cors_proxy + encodeURIComponent(target.href) : target.href;
  if (["put", "post"].indexOf(opts.method.toLowerCase()) !== -1) {
    const content_length = parseInt(req_headers.get("content-length") || "0", 10);
    if (content_length > 0 && body_bytes.length < content_length) {
      this.pendingBody = {
        buf: body_bytes,
        cl: content_length,
        done: (body) => {
          opts.body = body;
          dispatch_fetch(this, fetch_url, opts);
        }
      };
      return;
    }
    opts.body = body_bytes;
  }
  dispatch_fetch(this, fetch_url, opts);
}
function dispatch_fetch(conn, fetch_url, opts) {
  let response_started = false;
  let handler = (resp) => {
    let resp_headers = new Headers(resp.headers);
    resp_headers.delete("content-encoding");
    resp_headers.delete("keep-alive");
    resp_headers.delete("content-length");
    resp_headers.delete("transfer-encoding");
    resp_headers.set("x-was-fetch-redirected", `${!!resp.redirected}`);
    resp_headers.set("x-fetch-resp-url", resp.url);
    resp_headers.set("connection", "close");
    conn.write(conn.net.form_response_head(resp.status, resp.statusText, resp_headers));
    response_started = true;
    if (resp.body && resp.body.getReader) {
      const resp_reader = resp.body.getReader();
      const pump = ({ value, done }) => {
        if (value) {
          conn.write(value);
        }
        if (done) {
          conn.close();
        } else {
          return resp_reader.read().then(pump);
        }
      };
      resp_reader.read().then(pump);
    } else {
      resp.arrayBuffer().then((buffer) => {
        conn.write(new Uint8Array(buffer));
        conn.close();
      });
    }
  };
  conn.net.fetch(fetch_url, opts).then(handler).catch((e) => {
    console.warn("Fetch Failed: " + fetch_url + "\n" + e);
    if (!response_started) {
      conn.net.respond_text_and_close(conn, 502, "Fetch Error", `Fetch ${fetch_url} failed:

${e.stack || e.message}`);
    }
    conn.close();
  });
}
FetchNetworkAdapter.prototype.fetch = async function(url, options) {
  if (this.cors_proxy) url = this.cors_proxy + encodeURIComponent(url);
  try {
    const resp = await fetch(url, options);
    const ab = await resp.arrayBuffer();
    return [resp, ab];
  } catch (e) {
    console.warn("Fetch Failed: " + url + "\n" + e);
    return [
      {
        status: 502,
        statusText: "Fetch Error",
        headers: new Headers({ "Content-Type": "text/plain" })
      },
      new TextEncoder().encode(`Fetch ${url} failed:

${e.stack}`).buffer
    ];
  }
};
FetchNetworkAdapter.prototype.form_response_head = function(status_code, status_text, headers) {
  let lines = [
    `HTTP/1.1 ${status_code} ${status_text}`
  ];
  for (const [key, value] of headers.entries()) {
    lines.push(`${key}: ${value}`);
  }
  return new TextEncoder().encode(lines.join("\r\n") + "\r\n\r\n");
};
FetchNetworkAdapter.prototype.respond_text_and_close = function(conn, status_code, status_text, body) {
  const headers = new Headers({
    "content-type": "text/plain",
    "content-length": body.length.toString(10),
    "connection": "close"
  });
  conn.writev([this.form_response_head(status_code, status_text, headers), new TextEncoder().encode(body)]);
  conn.close();
};
FetchNetworkAdapter.prototype.parse_http_header = function(header) {
  const parts = header.match(/^([^:]*):(.*)$/);
  if (!parts) {
    dbg_log("Unable to parse HTTP header", LOG_FETCH);
    return;
  }
  const key = parts[1];
  const value = parts[2].trim();
  if (key.length === 0) {
    dbg_log("Header key is empty, raw header", LOG_FETCH);
    return;
  }
  if (value.length === 0) {
    dbg_log("Header value is empty", LOG_FETCH);
    return;
  }
  if (!/^[\w-]+$/.test(key)) {
    dbg_log("Header key contains forbidden characters", LOG_FETCH);
    return;
  }
  if (!/^[\x20-\x7E]+$/.test(value)) {
    dbg_log("Header value contains forbidden characters", LOG_FETCH);
    return;
  }
  return { key, value };
};
FetchNetworkAdapter.prototype.send = function(data) {
  handle_fake_networking(data, this);
};
FetchNetworkAdapter.prototype.receive = function(data) {
  this.bus.send("net" + this.id + "-receive", new Uint8Array(data));
};
export {
  FetchNetworkAdapter
};
