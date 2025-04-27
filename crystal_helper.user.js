// ==UserScript==
// @name         Crystal Helper
// @namespace    http://tampermonkey.net/
// @version      0.8
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
            border: 1px solid #ddd;
            padding: 12px;
            border-radius: 6px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            display: none;
            z-index: 10000;
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
        if (!value || !crystalData) return;

        // 首先尝试精确匹配searchKey
        let matchingItems = crystalData.filter(item => 
            item._searchKey && item._searchKey.split(/[,，、]/).some(key => key.trim() === value)
        );

        // 如果没有精确匹配，则尝试模糊匹配
        if (matchingItems.length === 0) {
            matchingItems = crystalData.filter(item => 
                (item._searchKey && item._searchKey.includes(value))
            );
        }

        if (matchingItems.length > 0) {
            // 只显示name和category，不显示searchKey
            const info = matchingItems.map(item => {
                // 如果name和category相同，只显示一个
                const displayName = item.name === item.category ? item.name : `${item.name} - ${item.category}`;
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
                            ${displayName}
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
            const viewportWidth = window.innerWidth;
            
            // 垂直位置调整
            if (rect.bottom + tooltipHeight + 10 > viewportHeight) {
                tooltip.style.top = Math.max(5, rect.top - tooltipHeight - 5) + 'px';
            } else {
                tooltip.style.top = (rect.bottom + 5) + 'px';
            }
            
            // 水平位置调整
            let left = rect.left;
            if (left + tooltip.offsetWidth > viewportWidth) {
                left = viewportWidth - tooltip.offsetWidth - 5;
            }
            tooltip.style.left = Math.max(5, left) + 'px';
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

        // 添加ESC键关闭提示框
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                tooltip.style.display = 'none';
            }
        });
    }

    init();
})(); 
