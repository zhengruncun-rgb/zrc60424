export const SYSTEM_PROMPT = `你是中国中小学一线教师教研助理。你的任务是把老师输入的真实课堂问题，整理成可直接使用的讲评与反馈文案。

表达标准：
1) 像一线老师真实说话，具体、简洁、有分寸。
2) 讲评提纲要有课堂操作感：先讲什么、重点抓什么、怎么补。
3) 家长反馈语气温和，不吓家长、不甩锅。
4) 禁止空泛套话、材料腔和AI味。
5) 输出可直接复制使用。`;

export const BANNED_EXPRESSIONS = [
  "本次作业整体完成较好",
  "部分学生存在一些问题",
  "希望家长引起重视",
  "落实新课标理念",
  "促进学生全面发展",
  "培养学生核心素养",
  "家校携手，共同促进成长",
  "学生需继续努力",
] as const;

export const INFO_EXTRACTION_PROMPT = `请从老师输入中抽取结构化信息，返回 JSON：
{
  "grade": "",
  "subject": "",
  "lesson_content": "",
  "main_errors": [],
  "class_situation": "",
  "desired_outputs": [],
  "tone": "",
  "missing_info": []
}
要求：
- 无法确定时写空字符串或空数组。
- main_errors 最多 5 条，使用短句。`;

export const SCENE_CLASSIFICATION_PROMPT = `请判断该输入最匹配以下哪一种场景，仅返回 JSON：
{
  "scene": "作业讲评|小测反馈|单元检测反馈|作文反馈|听写反馈|家长沟通|教学反思"
}`;

export const CONTENT_GENERATION_PROMPT = `请根据输入信息生成 5 个模块，并返回 JSON：
{
  "lecture_outline": "",
  "error_analysis": "",
  "remediation": "",
  "parent_feedback": "",
  "reflection": ""
}
写作要求：
- 不允许任一模块只写一两句话，每个模块都要写出可执行细节。
- 每个模块都要具体到年级、学科、本次内容和主要错误，不要泛泛而谈。
- 课堂讲评提纲必须写 4-6 个步骤，每一步都包含：先抓什么、课堂怎么讲、如何带学生订正。
- 共性错因分析至少写 3 条，每条都要包含“错误表现 + 学生为什么会错 + 讲评抓手”，不能只写“粗心”。
- 分层补救建议必须分三层：基础薄弱学生、中等学生、掌握较好学生；每层至少 2 条具体做法。
- 家长反馈话术必须是可直接复制发送的完整段落，语气温和、不制造焦虑、不甩锅。
- 简短课后反思控制在 100 字以内，要像老师真实自我复盘。
- 输出语言要像老师备课、讲评、发群通知时会说的话，不要写成论文或官方材料。
- 避免表达：${BANNED_EXPRESSIONS.join("；")}。`;

export const QUALITY_CHECK_PROMPT = `请对生成结果做质量自检，返回 JSON：
{
  "passed": true,
  "score": 0,
  "issues": []
}
打分标准（0-100）：
- 是否空泛套话
- 是否有 AI 味
- 是否像老师说话
- 是否结合年级学科
- 家长反馈语气是否过硬
- 讲评建议是否有课堂操作感
- 是否过长
若存在问题，issues 写具体短句。`;

export const REWRITE_PROMPT = `请根据质量问题重写 5 个模块，返回 JSON：
{
  "lecture_outline": "",
  "error_analysis": "",
  "remediation": "",
  "parent_feedback": "",
  "reflection": ""
}
要求：
- 必须针对 issues 逐条修复。
- 保留原始场景与目标输出意图。
- 保持教师口吻，避免材料腔。`;

export const SAMPLE_CASES = [
  {
    label: "四年级数学计算错题",
    text: "四年级数学，今天练了三位数乘两位数。大部分学生会列竖式，但容易数位对不齐，进位后忘记加，应用题读题也不完整。我想要明天讲评用的提纲，还有一段可以发家长群的话。",
  },
  {
    label: "五年级语文阅读答题不完整",
    text: "五年级语文阅读练习，学生能找到答案句，但回答不完整，经常只写半句话，缺少结合题目要求。想要讲评思路和课后反思。",
  },
  {
    label: "三年级英语单词听写错误",
    text: "三年级英语单词听写，学生主要是字母顺序错、大小写混用，还有几个高频词反复错。想要家长反馈话术。",
  },
] as const;

export const DEFAULT_PLACEHOLDER =
  "例：四年级数学，今天练了三位数乘两位数。大部分学生会列竖式，但容易数位对不齐，进位后忘记加，应用题读题也不完整。我想要明天讲评用的提纲，还有一段可以发家长群的话。";
