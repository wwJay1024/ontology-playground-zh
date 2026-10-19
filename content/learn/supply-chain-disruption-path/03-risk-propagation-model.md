---
title: "风险传导模型"
slug: risk-propagation-model
description: "理解中断如何级联——7 条关系刻画供应商影响 → 零部件风险 → 产品敞口 → 缓解动作。"
order: 3
---

## 级联：7 条关系

本体的力量在关系里——它们规定了影响如何沿供应链流动。数据代理沿这些路径回答诸如"这家供应商出问题，会波及多少条产品线？"之类的问题。

### 1. **Supplier supplies Component**（供应商供应零部件，一对多）

```
Supplier "ChipX Corp" 
  supplies→ Component "GPU Module"
         → Component "Memory Board"
         → Component "Power Supply"
```

- **为什么重要**：一家供应商出问题，它供应的所有零部件都会受影响
- **查询示例**："列出台湾供应商供应的所有零部件"

### 2. **Component used in ProductLine**（零部件用于产品线，多对多）

```
Component "GPU Module"
  usedIn→ ProductLine "Gaming Laptop 2024"
       → ProductLine "Workstation Pro"
       → ProductLine "Tablet Plus"
```

- **为什么重要**：一个零部件断供，可能让多条产品线停摆
- **查询示例**："有多少条产品线依赖这个零部件？"

### 3. **DisruptionEvent affects Supplier**（中断事件影响供应商，多对多）

```
DisruptionEvent "Taiwan Power Outage 2024-05-01"
  affects→ Supplier "ChipX Corp"
        → Supplier "Memory Inc"
```

- **为什么重要**：一场灾害可以同时打击多家供应商
- **查询示例**："哪些供应商位于洪水区域内？"

### 4. **DisruptionEvent triggers RiskAssessment**（中断事件触发风险评估，一对多）

```
DisruptionEvent "Taiwan Power Outage"
  triggers→ RiskAssessment "Gaming Laptop - Impact Analysis"
         → RiskAssessment "Workstation - Impact Analysis"
```

- **为什么重要**：每次中断都会为受影响的产品线触发一次详细的影响分析
- **查询示例**："这次中断带来的风险营收总额是多少？"

### 5. **RiskAssessment recommends MitigationAction**（风险评估提出缓解动作，一对多）

```
RiskAssessment "Gaming Laptop - Impact Analysis"
  recommends→ MitigationAction "Activate Alt Supplier X"
           → MitigationAction "Increase Safety Stock"
           → MitigationAction "Redesign Component"
```

- **为什么重要**：每份影响分析都会给出一份排好优先级的动作清单
- **查询示例**："要把中断影响降到最低，最佳动作是什么？"

### 6. **MitigationAction activates AlternativeSupplier**（缓解动作启用替代供应商，多对多）

```
MitigationAction "Activate Alt Supplier X"
  activates→ AlternativeSupplier "ChipX Europe"
          → AlternativeSupplier "SemiCorp Japan"
```

- **为什么重要**：一个动作可以同时启用多家备份供应商
- **查询示例**："有哪些已预审的供应商可以接手？"

### 7. **AlternativeSupplier canReplace Supplier**（替代供应商可替换供应商，多对一）

```
AlternativeSupplier "ChipX Europe"
  canReplace→ Supplier "ChipX Corp"

AlternativeSupplier "SemiCorp Japan"  
  canReplace→ Supplier "ChipX Corp"
```

- **为什么重要**：关键供应商都有多家已批准的备份
- **查询示例**："这家供应商有已批准的备份吗？"

## 完整级联示例

沿一个真实场景走一遍影响传导：

```
DISRUPTION
│
├─ Taiwan Power Outage (2024-05-01, Critical severity)
│
├─ AFFECTS
│  └─ Supplier "ChipX Corp" (singleSourced=true)
│     ├─ SUPPLIES
│     │  ├─ Component "GPU Module" (daysOfSupplyOnHand=3)
│     │  │  ├─ USED IN
│     │  │  │  ├─ ProductLine "Gaming Laptop 2024" ($50M annual revenue)
│     │  │  │  ├─ ProductLine "Workstation Pro" ($30M annual revenue)
│     │  │  │
│     │  │  └─ TRIGGERS RiskAssessment
│     │  │     ├─ revenueAtRisk=$80M
│     │  │     ├─ timeToImpactDays=3
│     │  │     │
│     │  │     └─ RECOMMENDS
│     │  │        ├─ MitigationAction "Activate ChipX Europe"
│     │  │        │  ├─ estimatedCost=$2M
│     │  │        │  ├─ leadTimeSavedDays=2
│     │  │        │  │
│     │  │        │  └─ ACTIVATES
│     │  │        │     ├─ AlternativeSupplier "ChipX Europe" 
│     │  │        │     │  ├─ qualificationStatus=Approved
│     │  │        │     │  ├─ capacityAvailable=50,000 units/month
│     │  │        │     │  ├─ pricePremiumPercent=12%
│     │  │        │     │  │
│     │  │        │     │  └─ CAN REPLACE
│     │  │        │     │     └─ Supplier "ChipX Corp"
│     │  │        │     │
│     │  │        │     └─ AlternativeSupplier "SemiCorp Japan"
│     │  │        │        └─ (secondary option)
│     │  │        │
│     │  │        └─ MitigationAction "Increase Safety Stock"
│     │  │           └─ estimatedCost=$500K
│     │  │
│     │  └─ Component "Memory Board"
│     │     └─ (similar cascade...)
│
```

## 这种结构为何能支撑自动化

你的数据代理现在可以：

1. **发现** — "监控这些供应商和这个区域"
2. **追溯** — "ChipX Corp 一出问题，自动追到全部 14 条受影响的产品线"
3. **量化** — "算出风险营收（$80M）和影响到达时间（3 天）"
4. **建议** — "启用已预审的替代方案，省 2 天、花 $2M，而损失是 $80M"
5. **执行** — "发出采购告警、更新生产排期、通知相关方"
6. **学习** — "记录哪些动作真正奏效，实际影响与预估影响差多少"

## 基数规则

| 关系 | 基数 | 理由 |
|---|---|---|
| Supplier → Component | 1:N | 一家供应商可能供应多个零部件 |
| Component → ProductLine | M:N | 零部件被重复使用，产品之间共用零部件 |
| Disruption → Supplier | M:N | 一场灾害打击多家供应商，一家供应商也会面对多种威胁 |
| Disruption → Assessment | 1:N | 每次中断都会为每条受影响的产品线生成评估 |
| Assessment → Action | 1:N | 每份评估会建议多个动作 |
| Action → Alternative | M:N | 一个动作启用多家备份，备份也能应对多种情况 |
| Alternative → Supplier | M:1 | 一家主供应商对应多家已预审的备份 |

接下来，我们看如何在实践中用这个模型执行缓解流程。
