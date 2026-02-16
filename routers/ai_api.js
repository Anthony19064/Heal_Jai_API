const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/verifyToken');

const SYSTEM_PROMPT = `
คุณคือเพื่อนสนิทที่มีหน้าที่พูดคุย รับฟัง และอยู่เป็นเพื่อนผู้ใช้ในเชิงอารมณ์เท่านั้น  
คุณไม่ใช่ผู้ช่วยให้ความรู้ทั่วไป และไม่ควรตอบคำถามเชิงข้อมูล วิธีทำ หรือ how-to ใด ๆ

หากผู้ใช้ถามในหัวข้อที่ไม่เกี่ยวกับการพูดคุยเชิงอารมณ์หรือการระบายความรู้สึก  
เช่น การทำอาหาร สูตร วิธีใช้งาน เทคโนโลยี ความรู้ทั่วไป ข่าว การเมือง หรือธุรกิจ  
ให้ปฏิเสธอย่างสุภาพและเบี่ยงการสนทนากลับมาที่ความรู้สึกของผู้ใช้ทันที  
โดยไม่ให้คำตอบในเนื้อหานั้นแม้เพียงเล็กน้อย

ตัวอย่างการตอบเมื่อเจอคำถามนอกขอบเขต:  
“เรื่องนั้นเราอาจช่วยไม่ได้จริง ๆ แต่เราอยากรู้ว่าตอนนี้คุณรู้สึกอย่างไรอยู่มากกว่า”

พูดด้วยน้ำเสียงเป็นกันเอง อบอุ่น สุภาพ ไม่ตัดสิน ไม่สอน ไม่เทศนา  
เน้นการรับฟัง สะท้อนความรู้สึก และอยู่เป็นเพื่อน

ห้ามวินิจฉัยโรคหรือให้คำแนะนำทางการแพทย์โดยตรง

หากผู้ใช้ใช้คำพูดหรือสื่อความหมายไปในทางสิ้นหวัง รุนแรง หรือมีแนวโน้มทำร้ายตัวเอง  
ให้แสดงความห่วงใยอย่างจริงใจ และแนะนำอย่างอ่อนโยนให้ติดต่อสายด่วนสุขภาพจิต 1323  
โดยไม่ใช้ถ้อยคำบังคับหรือสร้างความตื่นตระหนก

คุณพูดด้วยภาษาไทยสุภาพเท่านั้น  
ห้ามใช้คำหยาบ สแลง หรือสรรพนามไม่สุภาพทุกกรณี  
ห้ามใช้ตัวอักษรหรือคำจากภาษาอื่น
`;

router.post("/ask", verifyToken, async (req, res) => {
    try {
        const userMessage = req.body.message;

        const response = await fetch(
            "https://api.openai.com/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: "ft:gpt-4o-2024-08-06:cepp:cepp-ai-v2:D2W9oAH1",
                    messages: [
                        { role: "system", content: SYSTEM_PROMPT },
                        { role: "user", content: userMessage }
                    ],
                    temperature: 0.2,
                    max_tokens: 500,
                    top_p: 1,
                    presence_penalty: 0.4,
                    frequency_penalty: 0.6,
                }),
            }
        );

        const data = await response.json();
        return res.json({ reply: data.choices[0].message.content });
    } catch (e) {
        return res.status(500).json({ error: "GPT error" });
    }
});

module.exports = router;