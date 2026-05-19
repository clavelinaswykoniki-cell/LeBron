/**
 * userProfile.js — 用户身份 + 资料管理（本地 storage 单例）
 *
 * 当前阶段（无真实 wx.login）：
 *   - openid 用本地生成的伪 openid (local_<ts>_<rand>)，存 lbr_openid
 *   - 资料（nickname / avatar_url）存 lbr_user_profile
 *
 * 后续接真实 wx.login 时：
 *   - getOrCreateOpenId 内部改成 wx.login → 后端 /api/auth/login → 真实 openid
 *   - 现有调用方契约不变
 */

const OPENID_KEY = "lbr_openid"
const PROFILE_KEY = "lbr_user_profile"

/** 返回 wx 对象，要求 get + set 都可用；否则返回 null */
function _wxStorage() {
  if (typeof wx === "undefined") return null
  if (typeof wx.getStorageSync !== "function") return null
  if (typeof wx.setStorageSync !== "function") return null
  return wx
}

function _genLocalOpenId() {
  return "local_" + Date.now() + "_" + Math.random().toString(36).slice(2, 10)
}

function getOrCreateOpenId() {
  const s = _wxStorage()
  if (!s) return _genLocalOpenId() // 非小程序环境，返回临时
  try {
    const existing = s.getStorageSync(OPENID_KEY)
    if (typeof existing === "string" && existing) return existing
    const fresh = _genLocalOpenId()
    s.setStorageSync(OPENID_KEY, fresh)
    return fresh
  } catch (e) {
    return _genLocalOpenId()
  }
}

function getProfile() {
  const s = _wxStorage()
  if (!s) {
    return { openid: _genLocalOpenId(), nickname: "", avatar_url: "" }
  }
  const openid = getOrCreateOpenId()
  try {
    const raw = s.getStorageSync(PROFILE_KEY)
    if (!raw || typeof raw !== "object") {
      return { openid: openid, nickname: "", avatar_url: "" }
    }
    return {
      openid: openid,
      nickname: typeof raw.nickname === "string" ? raw.nickname : "",
      avatar_url: typeof raw.avatar_url === "string" ? raw.avatar_url : ""
    }
  } catch (e) {
    return { openid: openid, nickname: "", avatar_url: "" }
  }
}

function setProfile(profile) {
  const s = _wxStorage()
  if (!s) return
  if (!profile || typeof profile !== "object") return
  try {
    const next = {
      openid: getOrCreateOpenId(),
      nickname: typeof profile.nickname === "string" ? profile.nickname : "",
      avatar_url: typeof profile.avatar_url === "string" ? profile.avatar_url : ""
    }
    s.setStorageSync(PROFILE_KEY, next)
  } catch (e) {
    // silent
  }
}

module.exports = {
  getOrCreateOpenId: getOrCreateOpenId,
  getProfile: getProfile,
  setProfile: setProfile,
  OPENID_KEY: OPENID_KEY,
  PROFILE_KEY: PROFILE_KEY
}
