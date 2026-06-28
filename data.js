// ========================================
// 广州旅行计划 - 行程数据
// ========================================

const tripData = {
    // 住宿信息
    accommodation: [
        {
            id: 1,
            dateRange: '7·1 — 7·5',
            nights: 4,
            location: '柏曼酒店(广州区庄地铁站店)',
            area: '区庄地铁站附近，1号线/6号线交汇',
            suitable: ['抵达', '休息', '自由活动', '西关路线'],
            metro: ['1号线', '6号线']
        },
        {
            id: 2,
            dateRange: '7·5 — 7·11',
            nights: 6,
            location: '麗枫酒店(广州江南西凤凰新村地铁站店)',
            area: '江南西/凤凰新村地铁站附近，2号线/8号线交汇',
            suitable: ['北京路', '广州塔', '广州南', '沙面', '天河', '番禺', '清远高铁衔接'],
            metro: ['2号线', '8号线']
        }
    ],

    // 日期信息
    dates: [
        { day: 1, date: '7·1', weekday: '周二', label: '留白', type: 'rest', intensity: 'light' },
        { day: 2, date: '7·2', weekday: '周三', label: '留白', type: 'rest', intensity: 'light' },
        { day: 3, date: '7·3', weekday: '周四', label: '留白', type: 'rest', intensity: 'light' },
        { day: 4, date: '7·4', weekday: '周五', label: '西关', type: 'city', intensity: 'medium' },
        { day: 5, date: '7·5', weekday: '周六', label: '北京路', type: 'city', intensity: 'medium' },
        { day: 6, date: '7·6', weekday: '周日', label: '广州塔', type: 'city', intensity: 'light' },
        { day: 7, date: '7·7', weekday: '周一', label: '大马戏', type: 'city', intensity: 'medium' },
        { day: 8, date: '7·8', weekday: '周二', label: '增城', type: 'outdoor', intensity: 'high' },
        { day: 9, date: '7·9', weekday: '周三', label: '缓冲', type: 'rest', intensity: 'light' },
        { day: 10, date: '7·10', weekday: '周四', label: '清远', type: 'far', intensity: 'high' },
        { day: 11, date: '7·11', weekday: '周五', label: '珠江', type: 'city', intensity: 'medium' },
        { day: 12, date: '7·12', weekday: '周六', label: '返程', type: 'rest', intensity: 'light' }
    ],

    // 每日计划
    dailyPlans: [
        {
            day: 1,
            date: '7·1',
            weekday: '周二',
            title: '抵达广州，安顿休息',
            tags: ['抵达', '轻松'],
            type: 'rest',
            intensity: 'light',
            accommodation: '柏曼酒店(广州区庄地铁站店)',
            route: ['抵达广州', '前往酒店', '安顿休息', '附近逛逛'],
            transport: '根据到达方式（飞机/高铁）前往区庄站附近酒店',
            weather: '室内为主，不受天气影响',
            note: '第一天以休息为主，适应广州天气和环境'
        },
        {
            day: 2,
            date: '7·2',
            weekday: '周三',
            title: '自由活动，探索东山口',
            tags: ['自由活动', '轻松'],
            type: 'rest',
            intensity: 'light',
            accommodation: '柏曼酒店(广州区庄地铁站店)',
            route: ['自然醒', '东山口散步', '庙前直街', '龟岗美食'],
            transport: '步行或地铁1号线/6号线',
            weather: '室内外结合，小雨可走',
            note: '东山口有很多特色小店和咖啡馆，适合慢慢逛'
        },
        {
            day: 3,
            date: '7·3',
            weekday: '周四',
            title: '休息调整，为西关做准备',
            tags: ['休息', '轻松'],
            type: 'rest',
            intensity: 'light',
            accommodation: '柏曼酒店(广州区庄地铁站店)',
            route: ['自然醒', '附近早茶', '休息调整', '准备明天行程'],
            transport: '地铁1号线/6号线',
            weather: '室内为主',
            note: '早点休息，明天西关路线走路较多'
        },
        {
            day: 4,
            date: '7·4',
            weekday: '周五',
            title: '西关风情 + 西华路美食',
            tags: ['城市路线', '中等强度', '美食'],
            type: 'city',
            intensity: 'medium',
            accommodation: '柏曼酒店(广州区庄地铁站店)',
            route: ['区庄', '荔枝湾涌', '泮塘五约', '西华路美食街', '流花湖公园'],
            transport: '从区庄出发约15分钟｜1号线到黄沙/长寿路；去流花湖约25分钟',
            weather: '半户外路线，怕暴晒和午后雷雨；下雨就缩短荔枝湾涌和流花湖',
            note: '西华路美食很多，可以边吃边逛；荔枝湾涌可以坐游船'
        },
        {
            day: 5,
            date: '7·5',
            weekday: '周六',
            title: '北京路步行街 + 海珠',
            tags: ['城市路线', '中等强度', '换酒店'],
            type: 'city',
            intensity: 'medium',
            accommodation: '麗枫酒店(广州江南西凤凰新村地铁站店)',
            route: ['柏曼酒店退房', '北京路步行街', '午餐', '前往海珠酒店', '休息'],
            transport: '地铁1号线到公园前；北京路到江南西约20分钟｜2号线',
            weather: '城市路线，小雨影响不大',
            note: '今天换酒店，行李可以寄存在地铁站或商场'
        },
        {
            day: 6,
            date: '7·6',
            weekday: '周日',
            title: '早茶 + 广州塔 + 小马智行',
            tags: ['城市路线', '轻松', '傍晚江边'],
            type: 'city',
            intensity: 'light',
            accommodation: '麗枫酒店(广州江南西凤凰新村地铁站店)',
            route: ['江南西', '禄运茶居早茶', '广州塔', '小马智行去琶洲', '阅江路散步看江景'],
            transport: '从酒店到广州塔约20分钟｜8号线到客村转3号线；广州塔到琶洲/阅江路用小马智行',
            weather: '适合傍晚以后看江边；雷雨就等雨小再去',
            note: '小马智行是定点上下车，出发前先看App站点'
        },
        {
            day: 7,
            date: '7·7',
            weekday: '周一',
            title: '长隆国际大马戏',
            tags: ['城市路线', '中等强度', '演出'],
            type: 'city',
            intensity: 'medium',
            accommodation: '麗枫酒店(广州江南西凤凰新村地铁站店)',
            route: ['酒店', '长隆国际大马戏', '晚餐', '返回酒店'],
            transport: '从江南西到长隆约40分钟｜3号线到汉溪长隆站',
            weather: '室内演出，不受天气影响',
            note: '提前确认当天场次时间；晚饭不要压太紧，预留充足时间'
        },
        {
            day: 8,
            date: '7·8',
            weekday: '周二',
            title: '增城白江湖森林公园',
            tags: ['户外路线', '高强度', '自然'],
            type: 'outdoor',
            intensity: 'high',
            accommodation: '麗枫酒店(广州江南西凤凰新村地铁站店)',
            route: ['酒店', '增城广场', '白江湖森林公园', '返回增城', '返回酒店'],
            transport: '从江南西到增城广场约1.5-2小时｜地铁多次换乘；增城广场到白江湖自驾约40-50分钟',
            weather: '户外日，主要看暴晒和雷雨；雷雨明显就不进山',
            note: '需要租车；带防晒、防蚊、水、帽子；适合走路的鞋'
        },
        {
            day: 9,
            date: '7·9',
            weekday: '周三',
            title: '缓冲日，休息调整',
            tags: ['休息', '轻松', '缓冲'],
            type: 'rest',
            intensity: 'light',
            accommodation: '麗枫酒店(广州江南西凤凰新村地铁站店)',
            route: ['自然醒', '附近逛逛', '休息调整', '准备明天清远行程'],
            transport: '地铁2号线/8号线',
            weather: '室内外结合',
            note: '昨天户外比较累，今天好好休息；检查明天清远行程准备情况'
        },
        {
            day: 10,
            date: '7·10',
            weekday: '周四',
            title: '清远古龙峡漂流',
            tags: ['远途', '高强度', '漂流'],
            type: 'far',
            intensity: 'high',
            accommodation: '麗枫酒店(广州江南西凤凰新村地铁站店)',
            route: ['酒店', '广州南站', '清远站', '古龙峡漂流', '竹院牛庄', '返回广州'],
            transport: '酒店到广州南约30分钟｜2号线直达，建议预留45-60分钟；广州南到清远约24-30分钟｜高铁；清远站到古龙峡自驾约40-50分钟',
            weather: '最看天气的一天；雷电、强降水、暴雨预警时不要硬去漂流',
            note: '需要租车；带换洗衣服、毛巾、防水袋、防滑鞋、眼镜绳；干衣服放车上'
        },
        {
            day: 11,
            date: '7·11',
            weekday: '周五',
            title: '珠江夜游 + 收尾',
            tags: ['城市路线', '中等强度', '江边'],
            type: 'city',
            intensity: 'medium',
            accommodation: '麗枫酒店(广州江南西凤凰新村地铁站店)',
            route: ['酒店', '沙面', '上下九', '珠江夜游', '返回酒店'],
            transport: '地铁2号线/8号线；珠江夜游码头在天字码头或大沙头码头',
            weather: '按天气和体力决定；坐船是加分项，不是必须项',
            note: '昨天漂流比较累，今天轻松一点；珠江夜游可以提前买票'
        },
        {
            day: 12,
            date: '7·12',
            weekday: '周六',
            title: '返程',
            tags: ['返程', '轻松'],
            type: 'rest',
            intensity: 'light',
            accommodation: '-',
            route: ['酒店', '退房', '前往机场/高铁站', '返程'],
            transport: '根据返程方式提前出发',
            weather: '不受天气影响',
            note: '根据返程时间合理安排；可以带些广州特产'
        }
    ],

    // 地图标记点
    mapMarkers: [
        // 住宿点
        { lat: 23.1380, lng: 113.2980, title: '柏曼酒店(广州区庄地铁站店)', type: 'hotel', desc: '7·1-7·5 住宿（4晚）' },
        { lat: 23.0950, lng: 113.2550, title: '麗枫酒店(广州江南西凤凰新村地铁站店)', type: 'hotel', desc: '7·5-7·11 住宿（6晚）' },
        // 景点
        { lat: 23.1291, lng: 113.2644, title: '广州塔', type: 'scenic', desc: '7·6 傍晚看江景' },
        { lat: 23.1189, lng: 113.2530, title: '荔枝湾涌', type: 'scenic', desc: '7·4 西关风情' },
        { lat: 23.1220, lng: 113.2450, title: '泮塘五约', type: 'scenic', desc: '7·4 西关古村' },
        { lat: 23.1370, lng: 113.2580, title: '流花湖公园', type: 'scenic', desc: '7·4 公园散步' },
        { lat: 23.1250, lng: 113.2480, title: '西华路美食街', type: 'food', desc: '7·4 美食' },
        { lat: 23.1300, lng: 113.2700, title: '北京路步行街', type: 'scenic', desc: '7·5 逛街' },
        { lat: 23.0800, lng: 113.3200, title: '长隆国际大马戏', type: 'scenic', desc: '7·7 演出' },
        { lat: 23.2900, lng: 113.8300, title: '增城白江湖', type: 'scenic', desc: '7·8 户外' },
        { lat: 23.6800, lng: 113.0600, title: '古龙峡', type: 'scenic', desc: '7·10 漂流' },
        { lat: 23.1150, lng: 113.2550, title: '沙面', type: 'scenic', desc: '7·11 历史街区' },
        { lat: 23.1250, lng: 113.2450, title: '上下九', type: 'scenic', desc: '7·11 步行街' },
        { lat: 23.1100, lng: 113.2600, title: '珠江夜游码头', type: 'scenic', desc: '7·11 夜游' },
        { lat: 23.1050, lng: 113.3700, title: '琶洲/阅江路', type: 'scenic', desc: '7·6 江边散步' },
        { lat: 22.9900, lng: 113.2680, title: '广州南站', type: 'scenic', desc: '7·10 清远高铁' }
    ],

    // 每日路线坐标（用于地图高亮）
    dailyRoutes: {
        1: [[23.1380, 113.2980]], // 柏曼酒店
        2: [[23.1380, 113.2980], [23.1289, 113.2870], [23.1270, 113.2850], [23.1260, 113.2860]], // 酒店→东山口→庙前直街→龟岗
        3: [[23.1380, 113.2980], [23.1350, 113.2950]], // 酒店→附近早茶
        4: [[23.1380, 113.2980], [23.1189, 113.2530], [23.1220, 113.2450], [23.1250, 113.2480], [23.1370, 113.2580]], // 区庄→荔枝湾→泮塘→西华路→流花湖
        5: [[23.1380, 113.2980], [23.1300, 113.2700], [23.0950, 113.2550]], // 柏曼→北京路→麗枫
        6: [[23.0950, 113.2550], [23.1080, 113.2620], [23.1291, 113.2644], [23.1050, 113.3700]], // 江南西→禄运茶居→广州塔→琶洲
        7: [[23.0950, 113.2550], [23.0750, 113.3100], [23.0800, 113.3200]], // 江南西→长隆附近→长隆
        8: [[23.0950, 113.2550], [23.2800, 113.8200], [23.2900, 113.8300]], // 江南西→增城广场→白江湖
        9: [[23.0950, 113.2550], [23.0980, 113.2580]], // 酒店→附近逛逛
        10: [[23.0950, 113.2550], [22.9900, 113.2680], [23.7100, 113.0400], [23.6800, 113.0600]], // 江南西→广州南→清远站→古龙峡
        11: [[23.0950, 113.2550], [23.1150, 113.2550], [23.1250, 113.2450], [23.1100, 113.2600]], // 江南西→沙面→上下九→珠江夜游
        12: [[23.0950, 113.2550], [23.1380, 113.2980]] // 麗枫→柏曼→返程
    },

    // 提醒信息
    reminders: {
        weather: {
            title: '天气判断',
            content: [
                '广州 7 月主要考虑暴晒、闷热、午后雷雨。',
                '城市路线小雨影响不大',
                '户外路线重点看雷雨、强降水',
                '7·8 增城和 7·10 清远最需关注天气'
            ]
        },
        confirm: {
            title: '提前确认',
            items: [
                '7·7 长隆国际大马戏：提前确认当天场次',
                '7·8 增城租车：取还车点选增城广场附近',
                '7·10 清远高铁：广州南不要卡点',
                '7·10 清远租车：取还车点选清远站附近',
                '7·10 古龙峡漂流：前一晚查天气和景区通知',
                '7·11 珠江夜游：按天气和体力决定'
            ]
        },
        packing: {
            title: '随身物品',
            categories: [
                {
                    name: '日常出门',
                    items: ['☂️ 晴雨伞', '🧴 防晒', '🔋 充电宝', '🧻 纸巾/湿巾', '👟 舒适鞋']
                },
                {
                    name: '7·8 增城户外',
                    items: ['🧴 防晒', '🦟 防蚊', '💧 水', '🧢 帽子', '👟 适合走路的鞋']
                },
                {
                    name: '7·10 清远漂流',
                    items: ['👕 换洗衣服', '🧖 毛巾', '📱 防水袋', '👟 防滑鞋', '👓 眼镜绳']
                }
            ]
        },
        principles: {
            title: '执行原则',
            highlight: '这份计划不是打卡表。',
            content: '每天保留一条主线即可，具体餐厅、停留时间和是否加项目，都按当天状态调整。',
            keyRoutes: [
                { date: '7·4', desc: '西关和西华路' },
                { date: '7·6', desc: '早茶、广州塔、小马智行' },
                { date: '7·7', desc: '长隆国际大马戏' },
                { date: '7·8', desc: '根据天气决定是否去白江湖' },
                { date: '7·10', desc: '根据天气决定是否漂流' },
                { date: '7·11', desc: '根据天气和体力决定是否珠江夜游' }
            ]
        }
    }
};

// 强度说明
const intensityInfo = {
    light: { label: '轻松', desc: '自由活动、室内、自然醒、返程' },
    medium: { label: '中等', desc: '城市路线、半日户外、换酒店' },
    high: { label: '高强度', desc: '增城户外、清远漂流、远途交通' }
};

// ========================================
// 费用计算相关配置
// ========================================

// 默认类目配置
const defaultCategories = {
    normal: [
        { id: 'hotel', name: '住宿', icon: 'building-2', color: '#3b82f6' },
        { id: 'food', name: '餐饮', icon: 'utensils', color: '#f59e0b' },
        { id: 'transport', name: '交通', icon: 'train-front', color: '#10b981' },
        { id: 'ticket', name: '门票', icon: 'ticket', color: '#8b5cf6' },
        { id: 'shopping', name: '购物', icon: 'shopping-bag', color: '#ec4899' },
        { id: 'other', name: '其他', icon: 'package', color: '#64748b' }
    ],
    family: [
        { id: 'family', name: '亲属卡消费', icon: 'credit-card', color: '#ef4444' }
    ]
};

// 支出比例配置
const expenseConfig = {
    normal: { maleRatio: 0.6, femaleRatio: 0.4, label: '一般支出' },
    family: { maleRatio: 0.7, femaleRatio: 0.3, label: '亲属卡' }
};

// 可选图标列表（用于类目管理时选择）
const availableIcons = [
    'building-2', 'utensils', 'train-front', 'ticket', 'shopping-bag', 'package',
    'credit-card', 'coffee', 'film', 'hospital', 'plane', 'smartphone', 'cake',
    'pizza', 'taxi', 'gift', 'gamepad-2', 'dumbbell', 'scissors', 'baby',
    'beer', 'ice-cream-cone', 'shopping-cart', 'wallet', 'banknote', 'receipt'
];

// 可选颜色列表
const availableColors = [
    '#3b82f6', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#ef4444',
    '#06b6d4', '#84cc16', '#f97316', '#6366f1', '#14b8a6', '#64748b'
];
