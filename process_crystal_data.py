import pandas as pd
import json

# 读取Excel文件
df = pd.read_excel('水晶.xlsx')

# 清理数据
df = df.fillna('')

# 转换为更易读的格式
data = []
for _, row in df.iterrows():
    if row['b']:  # 只保留有名称的记录
        item = {
            'name': row['a'].strip() if row['a'] else '',  # a列作为名称
            'category': row['b'].strip(),                  # b列作为类目
            'searchKey': row['c'].strip() if row['c'] else ''  # c列作为搜索关键词
        }
        data.append(item)

# 保存为格式化的JSON
with open('crystal_data.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2) 