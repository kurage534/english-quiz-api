const express = require('express');
const ExcelJS = require('exceljs');
const Ranking = require('../models/Ranking');
const router = express.Router();

// ランキング保存API
router.post('/', async (req, res) => {
    try {
        const { name, score, questionCount, date } = req.body;
        if (!name || score == null || questionCount == null || !date) {
            return res.status(400).json({ error: '不正なリクエスト' });
        }
        const ranking = new Ranking({ name, score, questionCount, date });
        await ranking.save();
        res.status(201).json({ message: '保存しました' });
    } catch (e) {
        res.status(500).json({ error: '保存に失敗しました' });
    }
});

// ランキング取得API
router.get('/', async (req, res) => {
    try {
        const questionCount = req.query.questionCount;
        const query = questionCount ? { questionCount: Number(questionCount) } : {};
        const rankings = await Ranking.find(query).sort({ score: -1, date: 1 }).limit(50);
        res.json(rankings);
    } catch (e) {
        res.status(500).json({ error: '取得に失敗しました' });
    }
});

// Excel出力API
router.get('/excel', async (req, res) => {
    try {
        const questionCount = req.query.questionCount;
        const query = questionCount ? { questionCount: Number(questionCount) } : {};
        const rankings = await Ranking.find(query).sort({ score: -1, date: 1 }).limit(50);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('ランキング');
        worksheet.columns = [
            { header: '名前', key: 'name' },
            { header: 'スコア', key: 'score' },
            { header: '出題数', key: 'questionCount' },
            { header: '日時', key: 'date' }
        ];
        worksheet.addRows(rankings.map(r => ({
            name: r.name,
            score: r.score,
            questionCount: r.questionCount,
            date: r.date
        })));

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=ranking.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    } catch (e) {
        res.status(500).json({ error: 'Excel出力に失敗しました' });
    }
});

module.exports = router;