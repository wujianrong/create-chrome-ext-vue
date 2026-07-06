/**
 * 全局类型声明
 *
 * __CROSS_WORLD_SECRET__ 由 webpack DefinePlugin 在构建时注入，
 * 每次构建生成唯一值，ISOLATED 和 MAIN 两个 bundle 注入相同值，
 * 用于 CrossWorldBridge 的安全校验。
 */
declare const __CROSS_WORLD_SECRET__: string
