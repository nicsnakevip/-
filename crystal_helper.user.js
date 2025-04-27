// ==UserScript==
// @name         Crystal Helper
// @namespace    http://tampermonkey.net/
// @version      0.8
// @description  帮助查询水晶信息
// @author       nicsnakevip
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// @connect      githubusercontent.com
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
                    console.log('收到数据响应:', response.status);
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
                    console.log('数据示例:', crystalData[0]);
                } catch (e) {
                    console.error('解析水晶数据失败:', e);
                    console.error('响应内容:', response.responseText.substring(0, 200));
                }
            },
            onerror: function(error) {
                console.error('加载水晶数据失败:', error);
            }
        });
    }

    // 创建悬浮提示框
    function createTooltip() {
        console.log('创建提示框');
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
            min-width: 180px;
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
        console.log('输入值:', value);
        console.log('当前数据状态:', crystalData ? '已加载' : '未加载');
        
        if (!value || !crystalData) {
            console.log('无效输入或数据未加载');
            tooltip.style.display = 'none';
            return;
        }

        // 首先尝试精确匹配name或category
        let matchingItems = crystalData.filter(item => {
            if (!item || typeof item !== 'object') return false;
            return item.category === value || 
                   (item.name && item.name.includes(value));
        });
        console.log('精确匹配结果数:', matchingItems.length);

        if (matchingItems.length > 0) {
            console.log('找到匹配项:', matchingItems);
            const info = matchingItems.map(item => {
                return `
                    <div style="
                        padding: 8px;
                        border: 1px solid #eee;
                        border-radius: 4px;
                        background: #fafafa;
                        margin-bottom: 8px;
                        line-height: 1.6;
                    ">
                        <div style="color: #34495e;">
                            <strong>${item.name || ''}</strong>
                            <div style="font-size: 12px; color: #666; margin-top: 4px;">分类名称: ${item.category || ''}</div>
                        </div>
                    </div>
                `;
            }).join('');

            tooltip.innerHTML = info;
            tooltip.style.display = 'block';
            
            // 设置提示框位置
            const rect = input.getBoundingClientRect();
            tooltip.style.top = (rect.bottom + 5) + 'px';
            tooltip.style.left = rect.left + 'px';
        } else {
            console.log('未找到匹配项');
            tooltip.style.display = 'none';
        }
    }

    // 初始化
    function init() {
        console.log('初始化脚本...');
        loadData();
        const tooltip = createTooltip();

        // 监听所有输入框
        document.addEventListener('focus', function(e) {
            if (e.target.tagName === 'INPUT') {
                console.log('输入框获得焦点');
                const input = e.target;
                const handler = () => showInfo(input, tooltip);
                input.addEventListener('input', handler);
                
                // 清理函数
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
        console.log('Crystal Helper 脚本开始运行');
        init();
    }
})(); 