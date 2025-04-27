// ==UserScript==
// @name         Crystal Helper
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  帮助查询水晶信息
// @author       nicsnakevip
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// ==/UserScript==

(function() {
    'use strict';

    // GitHub数据源
    const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/nicsnakevip/crystal_data/main/crystal_data.json';

    let crystalData = null;

    // 加载数据
    function loadData() {
        GM_xmlhttpRequest({
            method: 'GET',
            url: GITHUB_RAW_URL,
            onload: function(response) {
                try {
                    crystalData = JSON.parse(response.responseText);
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
            border: 1px solid #ccc;
            padding: 10px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            display: none;
            z-index: 10000;
            max-width: 300px;
            font-size: 14px;
            line-height: 1.5;
        `;
        document.body.appendChild(tooltip);
        return tooltip;
    }

    // 显示提示信息
    function showInfo(input, tooltip) {
        const value = input.value.trim();
        if (!value || !crystalData) return;

        const matchingItems = crystalData.filter(item => 
            item.name.includes(value) || 
            (item.info && item.info.includes(value))
        );

        if (matchingItems.length > 0) {
            const info = matchingItems.map(item => `
                <div style="margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">
                    <strong style="color: #333;">名称：</strong> ${item.name}<br>
                    ${item.category ? `<strong style="color: #333;">分类：</strong> ${item.category}<br>` : ''}
                    ${item.info ? `<strong style="color: #333;">相关信息：</strong> ${item.info}` : ''}
                </div>
            `).join('');

            tooltip.innerHTML = info;
            tooltip.style.display = 'block';
            
            // 设置提示框位置
            const rect = input.getBoundingClientRect();
            const tooltipHeight = tooltip.offsetHeight;
            const viewportHeight = window.innerHeight;
            
            // 如果提示框底部超出视窗，则显示在输入框上方
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
                input.addEventListener('input', () => showInfo(input, tooltip));
            }
        }, true);

        // 点击其他地方时隐藏提示框
        document.addEventListener('click', function(e) {
            if (!e.target.closest('input')) {
                tooltip.style.display = 'none';
            }
        });
    }

    init();
})(); 