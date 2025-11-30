import pandas as pd
import json
import re

# 读取Excel文件并提取单词数据
excel_file = 'corpus/pet单词测试.xlsx'
xls = pd.ExcelFile(excel_file)

# 存储所有单词数据
all_words = []

# 判断是否为纯数字
def is_number(s):
    try:
        float(s)
        return True
    except ValueError:
        return False

# 判断是否为英文单词（包含字母）
def is_english_word(s):
    if not s or pd.isna(s):
        return False
    s = str(s).strip()
    # 包含至少一个字母
    return bool(re.search(r'[a-zA-Z]', s))

# 判断是否为中文（包含中文字符）
def is_chinese(s):
    if not s or pd.isna(s):
        return False
    s = str(s).strip()
    # 包含中文字符
    return bool(re.search(r'[\u4e00-\u9fff]', s))

# 只处理指定的工作表
target_sheets = ['U1原词', 'U2原', 'U3原', 'U4原', 'U5原', 'U6原', 'U7原', 'U8原']

# 处理每个工作表
for sheet_name in target_sheets:
    if sheet_name not in xls.sheet_names:
        print(f"警告：工作表 {sheet_name} 不存在，跳过")
        continue
    try:
        df = pd.read_excel(excel_file, sheet_name=sheet_name)
        
        # 检查工作表格式
        # 如果第一列是数字（行号），说明是特殊格式
        first_col_is_number = False
        if len(df) > 0 and len(df.columns) > 0:
            first_val = df.iloc[0, 0]
            if pd.notna(first_val) and is_number(str(first_val)):
                first_col_is_number = True

        # 提取单词对
        for index, row in df.iterrows():
            if first_col_is_number:
                # 格式：行号 | 英文 | ... | 中文 | ...
                # 跳过第一列（行号），从第二列开始
                if len(row) >= 2:
                    # 第一对：第二列（英文）和第三列（如果有中文）
                    col1_idx = 1  # 第二列（索引1）
                    col2_idx = 2  # 第三列（索引2）
                    
                    if col1_idx < len(row) and col2_idx < len(row):
                        val1 = row.iloc[col1_idx]
                        val2 = row.iloc[col2_idx]
                        
                        if pd.notna(val1) and pd.notna(val2):
                            val1_str = str(val1).strip()
                            val2_str = str(val2).strip()
                            
                            # 判断哪个是英文，哪个是中文
                            if is_english_word(val1_str) and is_chinese(val2_str):
                                all_words.append({
                                    'english': val1_str,
                                    'chinese': val2_str,
                                    'unit': sheet_name
                                })
                            elif is_chinese(val1_str) and is_english_word(val2_str):
                                all_words.append({
                                    'english': val2_str,
                                    'chinese': val1_str,
                                    'unit': sheet_name
                                })
                    
                    # 第二对：第四列和第五列
                    if len(row) >= 5:
                        col3_idx = 3  # 第四列（索引3）
                        col4_idx = 4  # 第五列（索引4）
                        
                        if col3_idx < len(row) and col4_idx < len(row):
                            val3 = row.iloc[col3_idx]
                            val4 = row.iloc[col4_idx]
                            
                            if pd.notna(val3) and pd.notna(val4):
                                val3_str = str(val3).strip()
                                val4_str = str(val4).strip()
                                
                                # 跳过纯数字
                                if is_number(val3_str) or is_number(val4_str):
                                    continue
                                
                                # 判断哪个是英文，哪个是中文
                                if is_english_word(val3_str) and is_chinese(val4_str):
                                    all_words.append({
                                        'english': val3_str,
                                        'chinese': val4_str,
                                        'unit': sheet_name
                                    })
                                elif is_chinese(val3_str) and is_english_word(val4_str):
                                    all_words.append({
                                        'english': val4_str,
                                        'chinese': val3_str,
                                        'unit': sheet_name
                                    })
            else:
                # 标准格式：第一列是英文，第二列是中文，第三列是英文，第四列是中文
                # 处理第一对单词
                if len(row) >= 2 and pd.notna(row.iloc[0]) and pd.notna(row.iloc[1]):
                    english = str(row.iloc[0]).strip()
                    chinese = str(row.iloc[1]).strip()
                    
                    # 跳过标题行和无效数据
                    if (english and chinese and 
                        english.lower() not in ['pet u1', 'pet u2', 'pet u3', 'pet u4', 'pet u5', 'pet u6', 'pet u7', 'pet u8', 'u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8'] and
                        chinese.lower() not in ['unnamed: 1', 'unnamed: 2', 'unnamed: 3'] and
                        not is_number(english) and not is_number(chinese)):
                        all_words.append({
                            'english': english,
                            'chinese': chinese,
                            'unit': sheet_name
                        })

                # 处理第二对单词
                if len(row) >= 4 and pd.notna(row.iloc[2]) and pd.notna(row.iloc[3]):
                    english = str(row.iloc[2]).strip()
                    chinese = str(row.iloc[3]).strip()
                    
                    # 跳过标题行和无效数据
                    if (english and chinese and 
                        english.lower() not in ['unnamed: 2', 'unnamed: 3'] and
                        chinese.lower() not in ['unnamed: 3'] and
                        not is_number(english) and not is_number(chinese)):
                        all_words.append({
                            'english': english,
                            'chinese': chinese,
                            'unit': sheet_name
                        })

    except Exception as e:
        print(f"处理工作表 {sheet_name} 时出错: {e}")

# 清理数据
cleaned_words = []
for word in all_words:
    eng = word['english'].strip()
    chn = word['chinese'].strip()

    # 跳过纯数字、标题行和空行
    if (not eng or not chn or 
        eng.lower() in ['nan', ''] or chn.lower() in ['nan', ''] or
        is_number(eng) or is_number(chn) or
        len(eng) < 2 or len(chn) < 1):
        continue

    # 确保至少一个是英文，一个是中文
    if is_english_word(eng) and is_chinese(chn):
        cleaned_words.append({
            'english': eng,
            'chinese': chn,
            'unit': word['unit']
        })
    elif is_chinese(eng) and is_english_word(chn):
        # 如果顺序反了，交换一下
        cleaned_words.append({
            'english': chn,
            'chinese': eng,
            'unit': word['unit']
        })

# 去重
unique_words = []
seen = set()
for word in cleaned_words:
    key = (word['english'].lower(), word['chinese'])
    if key not in seen:
        unique_words.append(word)
        seen.add(key)

print(f"总共提取了 {len(unique_words)} 个单词对")

# 保存为JSON文件
with open('words_data.json', 'w', encoding='utf-8') as f:
    json.dump(unique_words, f, ensure_ascii=False, indent=2)

print("单词数据已保存到 words_data.json")

# 检查是否还有数字
numbers_found = [w for w in unique_words if is_number(w['english'])]
if numbers_found:
    print(f"\n警告：发现 {len(numbers_found)} 个数字条目（将被过滤）")
    print("示例：", numbers_found[:5])