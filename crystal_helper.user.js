// ==UserScript==
// @name         Crystal Helper
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  帮助查询水晶信息
// @author       nicsnakevip
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// @connect      githubusercontent.com
// @updateURL    https://raw.githubusercontent.com/nicsnakevip/crystal_data/main/crystal_helper.user.js
// ==/UserScript==

(function() {
    'use strict';

    // GitHub数据源
    const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/nicsnakevip/crystal_data/main/crystal_data.json';

    let crystalData = null;

    // 加载数据
    function loadData() {
        console.log('开始加载水晶数据...');
        GM_xmlhttpRequest({
            method: 'GET',
            url: GITHUB_RAW_URL,
            headers: {
                'Accept': 'application/json'
            },
            onload: function(response) {
                try {
                    if (response.status !== 200) {
                        console.error('加载失败，状态码:', response.status);
                        return;
                    }
                    
                    const data = JSON.parse(response.responseText);
                    if (!Array.isArray(data)) {
                        console.error('数据格式错误，应该是数组');
                        return;
                    }
                    
                    crystalData = data;
                    console.log('水晶数据加载成功:', crystalData.length + ' 条记录');
                } catch (e) {
                    console.error('解析水晶数据失败:', e);
                }
            },
            onerror: function(error) {
                console.error('加载水晶数据失败:', error);
            }
        });
    }

    // 创建悬浮提示框
    function createTooltip() {
        const tooltip = document.createElement('div');
        tooltip.style.cssText = `
            position: fixed;
            background: white;
            border: 1px solid #ddd;
            padding: 12px;
            border-radius: 6px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            display: none;
            z-index: 999999;
            max-width: 400px;
            min-width: 200px;
            font-size: 14px;
            line-height: 1.5;
            color: #333;
        `;
        document.body.appendChild(tooltip);
        return tooltip;
    }

    // 显示提示信息
    function showInfo(input, tooltip) {
        const value = input.value.trim();
        
        if (!value || !crystalData) {
            tooltip.style.display = 'none';
            return;
        }

        // 搜索匹配项
        let matchingItems = crystalData.filter(item => {
            if (!item || typeof item !== 'object') return false;
            
            // 优先匹配searchKey
            if (item.searchKey && item.searchKey === value) {
                return true;
            }
            
            // 如果没有完全匹配的searchKey，则进行模糊匹配
            return (item.searchKey && item.searchKey.includes(value));
        });

        if (matchingItems.length > 0) {
            const info = matchingItems.map(item => {
                return `
                    <div style="
                        padding: 10px;
                        border: 1px solid #e8e8e8;
                        border-radius: 4px;
                        background: #fafafa;
                        margin-bottom: 8px;
                    ">
                        <div style="color: #333;">
                            <div style="font-weight: bold; margin-bottom: 4px;">${item.name || ''}</div>
                            <div style="font-size: 13px; color: #666;">分类：${item.category || ''}</div>
                        </div>
                    </div>
                `;
            }).join('');

            tooltip.innerHTML = info;
            tooltip.style.display = 'block';
            
            // 设置提示框位置
            const rect = input.getBoundingClientRect();
            const tooltipHeight = tooltip.offsetHeight;
            const viewportHeight = window.innerHeight;
            
            if (rect.bottom + tooltipHeight > viewportHeight) {
                tooltip.style.top = (rect.top - tooltipHeight - 5) + 'px';
            } else {
                tooltip.style.top = (rect.bottom + 5) + 'px';
            }
            tooltip.style.left = rect.left + 'px';
        } else {
            tooltip.style.display = 'none';
        }
    }

    // 初始化
    function init() {
        loadData();
        const tooltip = createTooltip();

        // 监听所有输入框
        document.addEventListener('focus', function(e) {
            if (e.target.tagName === 'INPUT') {
                const input = e.target;
                const handler = () => showInfo(input, tooltip);
                input.addEventListener('input', handler);
                
                const cleanup = () => {
                    input.removeEventListener('input', handler);
                    input.removeEventListener('blur', cleanup);
                };
                input.addEventListener('blur', cleanup);
            }
        }, true);

        // 点击其他地方时隐藏提示框
        document.addEventListener('click', function(e) {
            if (!e.target.closest('input')) {
                tooltip.style.display = 'none';
            }
        });

        // 添加ESC键关闭提示框
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                tooltip.style.display = 'none';
            }
        });
    }

    // 确保脚本只初始化一次
    if (!window._crystalHelperInitialized) {
        window._crystalHelperInitialized = true;
        init();
    }
})(); 