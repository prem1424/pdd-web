const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const PORT = 3000;

// MongoDB connection settings (using standard format to bypass Windows SRV DNS failures)
const MONGODB_URI = 'mongodb://chnagasaisrikanth_db_user:qyLuXI1KQrAWuI4M@ac-dtvlniw-shard-00-00.czpdnof.mongodb.net:27017,ac-dtvlniw-shard-00-01.czpdnof.mongodb.net:27017,ac-dtvlniw-shard-00-02.czpdnof.mongodb.net:27017/smartstock?ssl=true&authSource=admin';
const DB_NAME = 'smartstock';


let db;

// Enable CORS and parsing of JSON bodies
app.use(cors());
app.use(express.json());

// Serve static files at the bottom of routing chain


// Helper for relative time formatting (notifications)
function timeAgo(dateString) {
    if (!dateString) return 'Just now';
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day(s) ago`;
    if (diffHours > 0) return `${diffHours} hour(s) ago`;
    if (diffMins > 0) return `${diffMins} minute(s) ago`;
    return 'Just now';
}

// Connect to MongoDB Atlas and ensure all 6 correct labs exist
async function initDB() {
    try {
        const client = await MongoClient.connect(MONGODB_URI);
        db = client.db(DB_NAME);
        console.log('Connected successfully to MongoDB Atlas!');

        // Remove OLD wrong labs from previous seeds
        const wrongLabNames = ['Chemistry Lab', 'Physics Lab'];
        await db.collection('labs').deleteMany({ name: { $in: wrongLabNames } });

        // Deduplicate: for each lab name, keep only one document
        const allLabs = await db.collection('labs').find().toArray();
        const seen = new Set();
        for (const lab of allLabs) {
            const name = lab.name;
            if (seen.has(name)) {
                // Remove duplicate
                await db.collection('labs').deleteOne({ _id: lab._id });
            } else {
                seen.add(name);
            }
        }

        // Always upsert all 6 correct labs to ensure they exist with correct data
        const correctLabs = [
            { name: 'Microbiology Lab', code: 'MB-01', department: 'Microbiology', location: 'Block A, Room 101', head: 'Dr. Priya Sharma', capacity: 42, status: 'active' },
            { name: 'Molecular Biology Lab', code: 'MB-02', department: 'Molecular Biology', location: 'Block B, Room 204', head: 'Dr. Rajesh Kumar', capacity: 35, status: 'active' },
            { name: 'Biotechnology Lab', code: 'BT-01', department: 'Biotechnology', location: 'Block C, Room 305', head: 'Dr. Ananya Roy', capacity: 50, status: 'active' },
            { name: 'Clinical Genetics Lab', code: 'CG-01', department: 'Genetics', location: 'Block A, Room 108', head: 'Dr. Vikram Singh', capacity: 28, status: 'active' },
            { name: 'Pathology Lab', code: 'PA-01', department: 'Pathology', location: 'Block D, Room 402', head: 'Dr. Meera Patel', capacity: 38, status: 'active' },
            { name: 'Bioinformatics Lab', code: 'BI-01', department: 'Bioinformatics', location: 'Block E, Room 501', head: 'Dr. Suresh Nair', capacity: 60, status: 'active' }
        ];

        for (const lab of correctLabs) {
            await db.collection('labs').updateOne(
                { name: lab.name },
                { $set: lab },
                { upsert: true }
            );
        }
        console.log('All 6 labs verified/seeded in database.');

        // Seed demo accounts (only if they don't already exist)
        const demoPassword = await bcrypt.hash('smartstock123', 10);
        const demoUsers = [
            { user_code: 'AUD001', full_name: 'Audit Admin', email: 'auditor@smartstock.in', role: 'auditor', department: 'Quality Control', avatar: 'AA' },
            { user_code: 'LH001', full_name: 'Dr. Priya Sharma', email: 'priya@smartstock.in', role: 'labhead', lab: 'Microbiology Lab', department: 'Microbiology', avatar: 'PS' },
            { user_code: 'LH002', full_name: 'Dr. Rajesh Kumar', email: 'rajesh@smartstock.in', role: 'labhead', lab: 'Molecular Biology Lab', department: 'Molecular Biology', avatar: 'RK' },
            { user_code: 'LH003', full_name: 'Dr. Ananya Roy', email: 'ananya@smartstock.in', role: 'labhead', lab: 'Biotechnology Lab', department: 'Biotechnology', avatar: 'AR' },
            { user_code: 'LH004', full_name: 'Dr. Vikram Singh', email: 'vikram@smartstock.in', role: 'labhead', lab: 'Clinical Genetics Lab', department: 'Genetics', avatar: 'VS' },
            { user_code: 'LH005', full_name: 'Dr. Meera Patel', email: 'meera@smartstock.in', role: 'labhead', lab: 'Pathology Lab', department: 'Pathology', avatar: 'MP' },
            { user_code: 'LH006', full_name: 'Dr. Suresh Nair', email: 'suresh@smartstock.in', role: 'labhead', lab: 'Bioinformatics Lab', department: 'Bioinformatics', avatar: 'SN' },
            { user_code: 'MB2024001', full_name: 'Rahul Verma', email: 'rahul@student.in', role: 'student', lab: 'Microbiology Lab', roll_no: 'MB2024001', year: '3rd Year', department: 'Microbiology', avatar: 'RV' },
            { user_code: 'MB2024002', full_name: 'Sneha Patel', email: 'sneha@student.in', role: 'student', lab: 'Molecular Biology Lab', roll_no: 'MB2024002', year: '2nd Year', department: 'Molecular Biology', avatar: 'SP' },
            { user_code: 'BT2024001', full_name: 'Arjun Nair', email: 'arjun@student.in', role: 'student', lab: 'Biotechnology Lab', roll_no: 'BT2024001', year: '1st Year', department: 'Biotechnology', avatar: 'AN' },
            { user_code: 'CG2024001', full_name: 'Kavitha Iyer', email: 'kavitha@student.in', role: 'student', lab: 'Clinical Genetics Lab', roll_no: 'CG2024001', year: '4th Year', department: 'Genetics', avatar: 'KI' },
            { user_code: 'PA2024001', full_name: 'Mohan Das', email: 'mohan@student.in', role: 'student', lab: 'Pathology Lab', roll_no: 'PA2024001', year: '3rd Year', department: 'Pathology', avatar: 'MD' },
            { user_code: 'BI2024001', full_name: 'Divya Krishnan', email: 'divya@student.in', role: 'student', lab: 'Bioinformatics Lab', roll_no: 'BI2024001', year: '2nd Year', department: 'Bioinformatics', avatar: 'DK' },
        ];
        for (const user of demoUsers) {
            const existing = await db.collection('users').findOne({ user_code: user.user_code });
            if (!existing) {
                await db.collection('users').insertOne({ ...user, password: demoPassword, created_at: new Date() });
            }
        }
        // Auto-approve enrollment for demo students
        for (const user of demoUsers.filter(u => u.role === 'student')) {
            if (user.lab) {
                const enrollment = await db.collection('enrollment_requests').findOne({ student_roll: user.user_code, lab_name: user.lab });
                if (!enrollment) {
                    await db.collection('enrollment_requests').insertOne({
                        student_roll: user.user_code, student_name: user.full_name,
                        lab_name: user.lab, request_date: new Date().toISOString().split('T')[0],
                        status: 'approved', created_at: new Date()
                    });
                }
            }
        }
        console.log('Demo accounts ready. Password for all: smartstock123');
    } catch (err) {
        console.error('Failed to connect to MongoDB Atlas:', err);
    }
}


// ==========================================
// API ROUTES (Mapping PHP endpoints)
// ==========================================

// 1. LOGIN API
app.post('/api/auth/login.php', async (req, res) => {
    const { user_code, password, role } = req.body;
    if (!user_code || !password) {
        return res.json({ success: false, message: 'User code and password are required' });
    }

    try {
        const user = await db.collection('users').findOne({
            $or: [{ user_code }, { email: user_code }]
        });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.json({ success: false, message: 'Invalid credentials' });
        }


        if (role && user.role !== role) {
            return res.json({ success: false, message: 'Role mismatch' });
        }

        const nameParts = user.full_name.split(' ');
        const avatar = nameParts.map(p => p[0]?.toUpperCase()).join('');

        res.json({
            success: true,
            user: {
                id: user._id.toString(),
                name: user.full_name,
                email: user.email,
                role: user.role,
                lab: user.lab || null,
                user_code: user.user_code,
                department: user.department || null,
                avatar: avatar,
                rollNo: user.roll_no || null,
                roll_no: user.roll_no || null,
                year: user.year || null
            }
        });
    } catch (e) {
        res.json({ success: false, message: e.message });
    }
});

// 2. REGISTER API
app.post('/api/auth/register.php', async (req, res) => {
    const { user_code, full_name, email, password, role, lab, department, roll_no, year } = req.body;
    if (!user_code || !full_name || !email || !password || !role) {
        return res.json({ success: false, message: 'All required fields must be filled' });
    }

    try {
        const existing = await db.collection('users').findOne({
            $or: [{ user_code }, { email }]
        });
        if (existing) {
            return res.json({ success: false, message: 'User code or email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const nameParts = full_name.split(' ');
        const avatar = nameParts.map(p => p[0]?.toUpperCase()).join('');

        await db.collection('users').insertOne({
            user_code,
            full_name,
            email,
            password: hashedPassword,
            role,
            lab: lab || null,
            department: department || null,
            roll_no: roll_no || null,
            year: year || null,
            avatar,
            created_at: new Date()
        });

        res.json({ success: true, message: 'Registration successful' });
    } catch (e) {
        res.json({ success: false, message: e.message });
    }
});

// 3. FORGOT PASSWORD API
app.post('/api/auth/forgot_password.php', async (req, res) => {
    const { action, email, otp, new_password } = req.body;
    try {
        if (action === 'send_otp') {
            if (!email) return res.json({ success: false, message: 'Email required' });
            const user = await db.collection('users').findOne({ email });
            if (!user) return res.json({ success: false, message: 'Email not found' });

            const code = Math.floor(100000 + Math.random() * 900000).toString();
            const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

            await db.collection('password_resets').insertOne({
                email,
                otp: code,
                expires_at: expires,
                used: false
            });
            res.json({ success: true, message: `OTP sent to email. (Dev OTP: ${code})` });

        } else if (action === 'reset_password') {
            if (!email || !otp || !new_password) {
                return res.json({ success: false, message: 'All fields required' });
            }

            const reset = await db.collection('password_resets').findOne({
                email,
                otp,
                used: false,
                expires_at: { $gt: new Date() }
            });

            if (!reset) return res.json({ success: false, message: 'Invalid or expired OTP' });

            const hashedPassword = await bcrypt.hash(new_password, 10);
            await db.collection('users').updateOne({ email }, { $set: { password: hashedPassword } });
            await db.collection('password_resets').updateOne({ _id: reset._id }, { $set: { used: true } });

            res.json({ success: true, message: 'Password reset successful' });
        } else {
            res.json({ success: false, message: 'Invalid action' });
        }
    } catch (e) {
        res.json({ success: false, message: e.message });
    }
});

// 4. LABS API
app.get('/api/labs.php', async (req, res) => {
    const action = req.query.action;
    const labName = req.query.name;

    try {
        if (action === 'list') {
            if (labName) {
                const lab = await db.collection('labs').findOne({ name: labName });
                if (!lab) return res.json({ success: false, message: 'Lab not found' });
                
                const equipment = await db.collection('equipment').find({ lab: labName }).toArray();
                const chemicals = await db.collection('chemicals').find({ lab: labName }).toArray();
                const students = await db.collection('users').find({ role: 'student', lab: labName }).toArray();

                // Format fields
                equipment.forEach(e => e.id = e._id.toString());
                chemicals.forEach(c => { c.id = c._id.toString(); c.stock = c.quantity; });
                students.forEach(s => { s.id = s._id.toString(); s.name = s.full_name; s.roll_no = s.roll_no || s.user_code; s.attendance = 90; s.status = 'active'; });

                res.json({ success: true, lab, equipment, chemicals, students });
            } else {
                const labs = await db.collection('labs').find().toArray();
                // For each lab, compute live counts for students, equipment, chemicals
                const enrichedLabs = await Promise.all(labs.map(async (l) => {
                    const ln = l.name;
                    const eqCount = await db.collection('equipment').countDocuments({ lab: ln });
                    const chCount = await db.collection('chemicals').countDocuments({ lab: ln });
                    const stCount = await db.collection('users').countDocuments({ role: 'student', lab: ln });
                    // Compute utilization: (equipment + students) / capacity * 100, capped at 100
                    const capacity = l.capacity || 30;
                    const utilization = Math.min(Math.round(((eqCount + stCount) / Math.max(capacity, 1)) * 100), 100) || Math.floor(60 + Math.random() * 35);
                    return {
                        ...l,
                        id: l._id.toString(),
                        students: stCount,
                        equipment: eqCount,
                        chemicals: chCount,
                        utilization
                    };
                }));
                res.json({ success: true, labs: enrichedLabs });
            }
        }
    } catch (e) {
        res.json({ success: false, message: e.message });
    }
});

app.post('/api/labs.php', async (req, res) => {
    const action = req.query.action;
    try {
        if (action === 'add') {
            const { name, code, head, location, status, department } = req.body;
            await db.collection('labs').insertOne({ name, code, head, location, status: status || 'active', department });
            res.json({ success: true, message: 'Lab added successfully' });
        } else if (action === 'edit') {
            const { id, name, code, head, location, status, old_name } = req.body;
            const filter = old_name ? { name: old_name } : { _id: new ObjectId(id) };
            const update = {};
            if (name) update.name = name;
            if (code) update.code = code;
            if (head) update.head = head;
            if (location) update.location = location;
            if (status) update.status = status;

            await db.collection('labs').updateOne(filter, { $set: update });
            res.json({ success: true, message: 'Lab updated successfully' });
        } else if (action === 'delete') {
            const { id, name } = req.body;
            const filter = id ? { _id: new ObjectId(id) } : { name };
            await db.collection('labs').deleteOne(filter);
            res.json({ success: true, message: 'Lab deleted successfully' });
        }
    } catch (e) {
        res.json({ success: false, message: e.message });
    }
});

// 5. INVENTORY API
app.get('/api/inventory.php', async (req, res) => {
    const action = req.query.action;
    const lab = req.query.lab;

    try {
        if (action === 'get_equipment') {
            const filter = lab ? { lab } : {};
            const equipment = await db.collection('equipment').find(filter).toArray();
            equipment.forEach(e => e.id = e._id.toString());
            res.json({ success: true, equipment });
        } else if (action === 'get_chemicals') {
            const filter = lab ? { lab } : {};
            const chemicals = await db.collection('chemicals').find(filter).toArray();
            chemicals.forEach(c => {
                c.id = c._id.toString();
                c.quantity = parseFloat(c.quantity || 0);
                c.min_stock = parseFloat(c.min_stock || 0);
                if (c.quantity <= 0) c.status = 'critical';
                else if (c.quantity <= c.min_stock) c.status = 'low-stock';
                else c.status = 'active';
            });
            res.json({ success: true, chemicals });
        } else if (action === 'get_history') {
            const filter = {};
            if (req.query.date) filter.date = req.query.date;
            if (req.query.action_type) filter.action = req.query.action_type;
            if (req.query.lab) filter.lab = req.query.lab;

            const history = await db.collection('stock_history').find(filter).sort({ date: -1 }).toArray();
            history.forEach(h => h.id = h._id.toString());
            res.json({ success: true, history });
        }
    } catch (e) {
        res.json({ success: false, message: e.message });
    }
});

app.post('/api/inventory.php', async (req, res) => {
    const action = req.query.action;
    try {
        if (action === 'add_equipment') {
            await db.collection('equipment').insertOne({ ...req.body, quantity: parseInt(req.body.quantity || 1) });
            res.json({ success: true, message: 'Equipment added' });
        } else if (action === 'edit_equipment') {
            const { id, ...updateData } = req.body;
            await db.collection('equipment').updateOne({ _id: new ObjectId(id) }, { $set: { ...updateData, quantity: parseInt(updateData.quantity || 1) } });
            res.json({ success: true, message: 'Equipment updated' });
        } else if (action === 'delete_equipment') {
            await db.collection('equipment').deleteOne({ _id: new ObjectId(req.body.id) });
            res.json({ success: true, message: 'Equipment deleted' });
        } else if (action === 'add_chemical') {
            await db.collection('chemicals').insertOne({ ...req.body, quantity: parseFloat(req.body.quantity || 0), min_stock: parseFloat(req.body.min_stock || 0) });
            res.json({ success: true, message: 'Chemical added' });
        } else if (action === 'edit_chemical') {
            const { id, ...updateData } = req.body;
            await db.collection('chemicals').updateOne({ _id: new ObjectId(id) }, { $set: { ...updateData, quantity: parseFloat(updateData.quantity || 0), min_stock: parseFloat(updateData.min_stock || 0) } });
            res.json({ success: true, message: 'Chemical updated' });
        } else if (action === 'delete_chemical') {
            await db.collection('chemicals').deleteOne({ _id: new ObjectId(req.body.id) });
            res.json({ success: true, message: 'Chemical deleted' });
        } else if (action === 'add_item') {
            const { category, name, lab, brand, quantity, unit, min_stock, max_stock, location, expiry, hazard } = req.body;
            if (category === 'Equipment') {
                await db.collection('equipment').insertOne({ name, category, lab, manufacturer: brand, quantity: parseInt(quantity || 1), location, status: 'operational' });
            } else {
                await db.collection('chemicals').insertOne({ name, category, lab, quantity: parseFloat(quantity || 0), unit, min_stock: parseFloat(min_stock || 0), max_stock: parseFloat(max_stock || 100), location, expiry, hazard_level: hazard });
            }
            res.json({ success: true, message: 'Item added' });
        } else if (action === 'edit_item') {
            const { id, category, name, lab, location, brand, model, quantity, status, next_maintenance, supplier, unit, stock, expiry, hazard, cas, grade, min_stock, max_stock } = req.body;
            if (category === 'Equipment') {
                await db.collection('equipment').updateOne({ _id: new ObjectId(id) }, { $set: { name, lab, location, manufacturer: brand, model, quantity: parseInt(quantity || 1), status, next_maintenance } });
            } else {
                await db.collection('chemicals').updateOne({ _id: new ObjectId(id) }, { $set: { name, lab, location, supplier, unit, quantity: parseFloat(stock || quantity || 0), expiry, hazard_level: hazard, cas_number: cas, grade, min_stock: parseFloat(min_stock || 0), max_stock: parseFloat(max_stock || 100) } });
            }
            res.json({ success: true, message: 'Item updated' });
        } else if (action === 'delete_item') {
            const { id, category } = req.body;
            const collection = (category === 'Equipment') ? 'equipment' : 'chemicals';
            await db.collection(collection).deleteOne({ _id: new ObjectId(id) });
            res.json({ success: true, message: 'Item deleted' });
        } else if (action === 'use_stock') {
            const { item_id, quantity, user, lab, reason } = req.body;
            const chem = await db.collection('chemicals').findOne({ _id: new ObjectId(item_id) });
            if (chem) {
                const newQty = Math.max((chem.quantity || 0) - parseFloat(quantity), 0);
                await db.collection('chemicals').updateOne({ _id: chem._id }, { $set: { quantity: newQty } });
                await db.collection('stock_history').insertOne({
                    item: chem.name, action: 'used', quantity: parseFloat(quantity), unit: chem.unit, by_user: user, lab, date: new Date().toISOString().split('T')[0], reason
                });
            }
            res.json({ success: true, message: 'Stock updated' });
        } else if (action === 'update_stock') {
            const { type, item_id, quantity, by_user, lab, reason } = req.body;
            const collection = type === 'equipment' ? 'equipment' : 'chemicals';
            const item = await db.collection(collection).findOne({ _id: new ObjectId(item_id) });
            if (item) {
                const newQty = Math.max((item.quantity || 0) - parseFloat(quantity), 0);
                await db.collection(collection).updateOne({ _id: item._id }, { $set: { quantity: newQty } });
                await db.collection('stock_history').insertOne({
                    item: item.name, action: 'used', quantity: parseFloat(quantity), by_user, lab, date: new Date().toISOString().split('T')[0], reason
                });
            }
            res.json({ success: true });
        } else if (action === 'log_usage') {
            const { item, type, quantity, unit, by_user, lab, date, reason } = req.body;
            await db.collection('stock_history').insertOne({ item, action: 'used', action_type: type, quantity: parseFloat(quantity), unit, by_user, lab, date: date || new Date().toISOString().split('T')[0], reason });
            res.json({ success: true });
        }
    } catch (e) {
        res.json({ success: false, message: e.message });
    }
});

// 6. TASKS API
app.get('/api/tasks.php', async (req, res) => {
    const action = req.query.action;
    const lab = req.query.lab;
    try {
        if (action === 'list') {
            const filter = lab ? { lab } : {};
            const tasks = await db.collection('tasks').find(filter).toArray();
            tasks.forEach(t => t.id = t._id.toString());
            res.json({ success: true, tasks });
        }
    } catch (e) {
        res.json({ success: false, message: e.message });
    }
});

app.post('/api/tasks.php', async (req, res) => {
    const action = req.query.action;
    try {
        if (action === 'add' || action === 'create') {
            const { title, description, assigned_to, assigned_by, lab, due_date, priority } = req.body;
            await db.collection('tasks').insertOne({ title, description, assigned_to, assigned_by, lab, due_date, priority, status: 'pending' });
            res.json({ success: true, message: 'Task created' });
        } else if (action === 'update_status') {
            const { task_id, status } = req.body;
            await db.collection('tasks').updateOne({ _id: new ObjectId(task_id) }, { $set: { status } });
            res.json({ success: true, message: 'Task updated' });
        } else if (action === 'delete') {
            await db.collection('tasks').deleteOne({ _id: new ObjectId(req.body.task_id) });
            res.json({ success: true, message: 'Task deleted' });
        }
    } catch (e) {
        res.json({ success: false, message: e.message });
    }
});

// 7. ATTENDANCE API
app.get('/api/attendance.php', async (req, res) => {
    const action = req.query.action;
    const lab = req.query.lab;
    try {
        if (action === 'list') {
            const filter = lab ? { lab } : {};
            const attendance = await db.collection('attendance').find(filter).sort({ date: -1 }).toArray();
            attendance.forEach(a => a.id = a._id.toString());
            res.json({ success: true, attendance });
        } else if (action === 'student_history') {
            const rollNo = req.query.roll_no;
            const records = await db.collection('attendance').find({ roll_no: rollNo }).sort({ date: -1 }).toArray();
            records.forEach(r => r.id = r._id.toString());
            const total = records.length;
            const present = records.filter(r => r.status === 'present').length;
            const absent = records.filter(r => r.status === 'absent').length;
            const late = records.filter(r => r.status === 'late').length;
            const rate = total > 0 ? Math.round((present + late) / total * 100) + '%' : 'N/A';

            res.json({ success: true, attendance: records, stats: { total, present, absent, late, total_days: total, attendance_rate: rate } });
        }
    } catch (e) {
        res.json({ success: false, message: e.message });
    }
});

app.post('/api/attendance.php', async (req, res) => {
    const action = req.query.action;
    try {
        if (action === 'mark') {
            const { student_name, roll_no, lab, status, date, time_in } = req.body;
            await db.collection('attendance').insertOne({ student_name, roll_no, lab, date: date || new Date().toISOString().split('T')[0], status, time_in: time_in || new Date().toLocaleTimeString() });
            res.json({ success: true, message: 'Attendance marked' });
        } else if (action === 'qr_checkin') {
            const { student_name, roll_no, lab } = req.body;
            await db.collection('attendance').insertOne({ student_name, roll_no, lab, date: new Date().toISOString().split('T')[0], status: 'present', time_in: new Date().toLocaleTimeString() });
            res.json({ success: true, message: 'QR check-in successful' });
        } else if (action === 'generate_qr') {
            const { lab, date } = req.body;
            const qrData = JSON.stringify({ lab, date: date || new Date().toISOString().split('T')[0], code: Math.random().toString(36).substring(7) });
            res.json({ success: true, qr_data: qrData, message: 'QR generated' });
        } else if (action === 'submit_list') {
            const { date, records } = req.body;
            const targetDate = date || new Date().toISOString().split('T')[0];
            for (const r of records) {
                const existing = await db.collection('attendance').findOne({ roll_no: r.roll_no, date: targetDate });
                if (existing) {
                    await db.collection('attendance').updateOne({ _id: existing._id }, { $set: { status: r.status, time_in: r.time_in, time_out: r.time_out } });
                } else {
                    await db.collection('attendance').insertOne({ student_name: r.name, roll_no: r.roll_no, date: targetDate, status: r.status, time_in: r.time_in, time_out: r.time_out });
                }
            }
            res.json({ success: true, message: 'Attendance saved' });
        }
    } catch (e) {
        res.json({ success: false, message: e.message });
    }
});

// 8. ACTIVITIES API
app.get('/api/activities.php', async (req, res) => {
    const action = req.query.action;
    const lab = req.query.lab;
    try {
        if (action === 'list') {
            const filter = lab ? { lab } : {};
            const activities = await db.collection('activities').find(filter).sort({ date: -1 }).toArray();
            activities.forEach(a => a.id = a._id.toString());
            res.json({ success: true, activities });
        } else if (action === 'delete') {
            await db.collection('activities').deleteOne({ _id: new ObjectId(req.query.id) });
            res.json({ success: true, message: 'Activity deleted' });
        }
    } catch (e) {
        res.json({ success: false, message: e.message });
    }
});

app.post('/api/activities.php', async (req, res) => {
    const action = req.query.action;
    try {
        if (action === 'add' || action === 'submit') {
            const { student, date, lab, experiment, duration, chemicals, equipment, notes, status } = req.body;
            const result = await db.collection('activities').insertOne({
                student, date: date || new Date().toISOString().split('T')[0], lab, experiment, duration,
                chemicals: Array.isArray(chemicals) ? chemicals.join(', ') : chemicals,
                equipment: Array.isArray(equipment) ? equipment.join(', ') : equipment,
                notes, status: status || 'completed', created_at: new Date()
            });
            res.json({ success: true, id: result.insertedId.toString(), message: 'Activity submitted' });
        } else if (action === 'update') {
            const { id, student, date, lab, experiment, notes, status, duration, chemicals, equipment } = req.body;
            await db.collection('activities').updateOne({ _id: new ObjectId(id) }, {
                $set: {
                    student, date, lab, experiment, notes, status, duration,
                    chemicals: Array.isArray(chemicals) ? chemicals.join(', ') : chemicals,
                    equipment: Array.isArray(equipment) ? equipment.join(', ') : equipment
                }
            });
            res.json({ success: true, message: 'Activity updated' });
        }
    } catch (e) {
        res.json({ success: false, message: e.message });
    }
});

// 9. APPROVALS API
app.get('/api/approvals.php', async (req, res) => {
    const action = req.query.action;
    const lab = req.query.lab;
    try {
        if (action === 'list') {
            const filter = lab ? { lab } : {};
            const requests = await db.collection('approval_requests').find(filter).sort({ created_at: -1 }).toArray();
            requests.forEach(r => r.id = r._id.toString());
            res.json({ success: true, requests });
        }
    } catch (e) {
        res.json({ success: false, message: e.message });
    }
});

app.post('/api/approvals.php', async (req, res) => {
    const action = req.query.action;
    try {
        if (action === 'add' || action === 'submit') {
            const { type, title, requested_by, lab, quantity, urgency, notes } = req.body;
            await db.collection('approval_requests').insertOne({ type, title, requested_by, lab, quantity, urgency, notes, date: new Date().toISOString().split('T')[0], status: 'pending', created_at: new Date() });
            res.json({ success: true, message: 'Request submitted' });
        } else if (action === 'handle') {
            const { request_id, action: handleAction, handled_by } = req.body;
            const status = handleAction === 'approve' ? 'approved' : 'rejected';
            await db.collection('approval_requests').updateOne({ _id: new ObjectId(request_id) }, { $set: { status, handled_by } });
            res.json({ success: true, message: `Request ${status}` });
        } else if (action === 'update_status') {
            const { id, status } = req.body;
            await db.collection('approval_requests').updateOne({ _id: new ObjectId(id) }, { $set: { status } });
            res.json({ success: true, message: 'Status updated' });
        }
    } catch (e) {
        res.json({ success: false, message: e.message });
    }
});

// 10. STUDENT CONTROL API
app.get('/api/student.php', async (req, res) => {
    const action = req.query.action;
    const lab = req.query.lab;
    try {
        if (action === 'list') {
            const filter = { role: 'student' };
            if (lab) filter.lab = lab;
            const students = await db.collection('users').find(filter).sort({ full_name: 1 }).toArray();
            students.forEach(s => {
                s.id = s._id.toString();
                s.name = s.full_name;
                s.roll_no = s.roll_no || s.user_code;
                s.status = 'active';
                s.attendance_rate = 'N/A';
                s.last_active = 'N/A';
            });
            res.json({ success: true, students });
        } else if (action === 'delete') {
            await db.collection('users').deleteOne({ roll_no: req.query.roll, role: 'student' });
            res.json({ success: true });
        }
    } catch (e) {
        res.json({ success: false, message: e.message });
    }
});

app.post('/api/student.php', async (req, res) => {
    const action = req.query.action;
    try {
        if (action === 'add') {
            const { name, roll_no, email, year, department, lab } = req.body;
            const hashedPw = await bcrypt.hash('password123', 10);
            const nameParts = name.split(' ');
            const avatar = nameParts.map(p => p[0]?.toUpperCase()).join('');
            await db.collection('users').insertOne({
                full_name: name, user_code: roll_no, email, password: hashedPw, role: 'student', roll_no, year, department, lab, avatar, created_at: new Date()
            });
            res.json({ success: true, message: 'Student added' });
        } else if (action === 'remove') {
            await db.collection('users').deleteOne({ _id: new ObjectId(req.body.student_id), role: 'student' });
            res.json({ success: true, message: 'Student removed' });
        }
    } catch (e) {
        res.json({ success: false, message: e.message });
    }
});

// 11. ENROLLMENT API
app.get('/api/enrollment.php', async (req, res) => {
    const action = req.query.action;
    try {
        if (action === 'list_pending') {
            const requests = await db.collection('enrollment_requests').find({ lab_name: req.query.lab_name, status: 'pending' }).sort({ created_at: -1 }).toArray();
            requests.forEach(r => { r.id = r._id.toString(); r.request_date = r.created_at || new Date(); });
            res.json({ success: true, requests });
        } else if (action === 'status') {
            const enrollments = await db.collection('enrollment_requests').find({ student_roll: req.query.student_roll }).toArray();
            enrollments.forEach(e => e.id = e._id.toString());
            res.json({ success: true, enrollments });
        }
    } catch (e) {
        res.json({ success: false, message: e.message });
    }
});

app.post('/api/enrollment.php', async (req, res) => {
    const action = req.query.action;
    try {
        if (action === 'request') {
            const { student_roll, student_name, lab_name } = req.body;
            await db.collection('enrollment_requests').insertOne({ student_roll, student_name, lab_name, request_date: new Date().toISOString().split('T')[0], status: 'pending', created_at: new Date() });
            res.json({ success: true });
        } else if (action === 'approve') {
            const { id } = req.body;
            await db.collection('enrollment_requests').updateOne({ _id: new ObjectId(id) }, { $set: { status: 'approved' } });
            const requestDoc = await db.collection('enrollment_requests').findOne({ _id: new ObjectId(id) });
            if (requestDoc) {
                await db.collection('users').updateOne({ roll_no: requestDoc.student_roll }, { $set: { lab: requestDoc.lab_name } });
            }
            res.json({ success: true });
        } else if (action === 'reject') {
            const { id } = req.body;
            await db.collection('enrollment_requests').updateOne({ _id: new ObjectId(id) }, { $set: { status: 'rejected' } });
            res.json({ success: true });
        }
    } catch (e) {
        res.json({ success: false, message: e.message });
    }
});

// 12. NOTIFICATIONS API
app.get('/api/notifications.php', async (req, res) => {
    const action = req.query.action;
    const lab = req.query.lab;
    try {
        if (action === 'list') {
            const filter = lab ? { $or: [{ lab }, { lab_name: lab }] } : {};
            const notifications = await db.collection('notifications').find(filter).sort({ created_at: -1 }).toArray();
            notifications.forEach(n => {
                n.id = n._id.toString();
                n.time = n.time || timeAgo(n.created_at);
                n.is_read = parseInt(n.is_read || 0);
            });
            res.json({ success: true, notifications });
        }
    } catch (e) {
        res.json({ success: false, message: e.message });
    }
});

app.post('/api/notifications.php', async (req, res) => {
    const action = req.query.action;
    try {
        if (action === 'mark_read') {
            await db.collection('notifications').updateMany({ is_read: 0 }, { $set: { is_read: 1 } });
            res.json({ success: true, message: 'All marked read' });
        } else if (action === 'clear') {
            await db.collection('notifications').deleteMany({});
            res.json({ success: true, message: 'All cleared' });
        } else if (action === 'delete_one') {
            await db.collection('notifications').deleteOne({ _id: new ObjectId(req.body.id) });
            res.json({ success: true });
        }
    } catch (e) {
        res.json({ success: false, message: e.message });
    }
});

// 13. MESSAGES API
app.get('/api/messages.php', async (req, res) => {
    const action = req.query.action;
    const user = req.query.user;
    try {
        if (action === 'list') {
            const filter = { $or: [{ sender: user }, { recipient: user }] };
            const messages = await db.collection('messages').find(filter).sort({ date: -1 }).toArray();
            messages.forEach(m => m.id = m._id.toString());
            res.json({ success: true, messages });
        }
    } catch (e) {
        res.json({ success: false, message: e.message });
    }
});

app.post('/api/messages.php', async (req, res) => {
    const action = req.query.action;
    try {
        if (action === 'send') {
            const { sender, recipient, subject, message, lab } = req.body;
            await db.collection('messages').insertOne({ sender, recipient, subject, message, lab, is_read: 0, date: new Date() });
            res.json({ success: true, message: 'Message sent' });
        }
    } catch (e) {
        res.json({ success: false, message: e.message });
    }
});

// 14. SEARCH API
app.get('/api/search.php', async (req, res) => {
    const q = req.query.q;
    const lab = req.query.lab;

    if (!q) {
        return res.json({ success: true, results: { equipment: [], chemicals: [], students: [], tasks: [] } });
    }

    try {
        const regex = new RegExp(q, 'i');

        const eqFilter = { name: regex };
        const chFilter = { name: regex };
        const stFilter = { role: 'student', $or: [{ full_name: regex }, { roll_no: regex }, { user_code: regex }] };
        const tkFilter = { title: regex };

        if (lab) {
            eqFilter.lab = lab;
            chFilter.lab = lab;
            stFilter.lab = lab;
            tkFilter.lab = lab;
        }

        const equipment = await db.collection('equipment').find(eqFilter).toArray();
        const chemicals = await db.collection('chemicals').find(chFilter).toArray();
        const students = await db.collection('users').find(stFilter).toArray();
        const tasks = await db.collection('tasks').find(tkFilter).toArray();

        equipment.forEach(e => e.id = e._id.toString());
        chemicals.forEach(c => c.id = c._id.toString());
        students.forEach(s => { s.id = s._id.toString(); s.name = s.full_name; s.roll_no = s.roll_no || s.user_code; });
        tasks.forEach(t => t.id = t._id.toString());

        res.json({ success: true, results: { equipment, chemicals, students, tasks } });
    } catch (e) {
        res.json({ success: false, message: e.message });
    }
});

// 15. PROFILE API
app.post('/api/profile.php', async (req, res) => {
    const { action, empid, old_empid, name, dept } = req.body;
    try {
        if (action === 'update') {
            const user = await db.collection('users').findOne({ user_code: old_empid });
            if (!user) return res.json({ success: false, error: 'User not found' });

            const newEmpid = empid || old_empid;
            await db.collection('users').updateOne({ user_code: old_empid }, { $set: { user_code: newEmpid, full_name: name, department: dept } });
            
            const updated = await db.collection('users').findOne({ user_code: newEmpid });
            const nameParts = updated.full_name.split(' ');
            const avatar = nameParts.map(p => p[0]?.toUpperCase()).join('');

            res.json({
                success: true,
                user: {
                    id: updated._id.toString(), name: updated.full_name, email: updated.email, role: updated.role,
                    lab: updated.lab || null, user_code: updated.user_code, department: updated.department || null,
                    avatar, rollNo: updated.roll_no || null, year: updated.year || null
                }
            });
        } else {
            res.json({ success: false, error: 'Invalid action' });
        }
    } catch (e) {
        res.json({ success: false, error: e.message });
    }
});

// 16. DASHBOARD API
app.get('/api/dashboard.php', async (req, res) => {
    const { role, user_code, lab } = req.query;

    try {
        const u = await db.collection('users').findOne({ user_code });
        const nameParts = u ? u.full_name.split(' ') : [];
        const avatar = nameParts.map(p => p[0]?.toUpperCase()).join('');
        const userObj = u ? {
            id: u._id.toString(), name: u.full_name, email: u.email, role: u.role, lab: u.lab || null,
            user_code: u.user_code, department: u.department || null, avatar, rollNo: u.roll_no || null,
            roll_no: u.roll_no || null, year: u.year || null
        } : null;

        if (role === 'auditor') {
            const totalLabs = await db.collection('labs').countDocuments();
            const totalEquip = await db.collection('equipment').countDocuments();
            const totalChem = await db.collection('chemicals').countDocuments();
            
            // Low stock
            const chemicals = await db.collection('chemicals').find().toArray();
            let lowStock = 0;
            chemicals.forEach(c => {
                if (parseFloat(c.quantity || 0) <= parseFloat(c.min_stock || 0)) lowStock++;
            });

            const expiring = await db.collection('chemicals').countDocuments({
                expiry: { $ne: null, $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }
            });

            const maintenanceDue = await db.collection('equipment').countDocuments({
                next_maintenance: { $ne: null, $lte: new Date().toISOString().split('T')[0] }
            });

            const recentActivities = await db.collection('activities').find().sort({ date: -1 }).limit(10).toArray();
            recentActivities.forEach(a => a.id = a._id.toString());
            const alerts = await db.collection('notifications').find().sort({ created_at: -1 }).limit(10).toArray();
            alerts.forEach(a => a.id = a._id.toString());

            const labSummaries = [];
            const labs = await db.collection('labs').find().toArray();
            for (const l of labs) {
                const ln = l.name;
                const ec = await db.collection('equipment').countDocuments({ lab: ln });
                const cc = await db.collection('chemicals').countDocuments({ lab: ln });
                const sc = await db.collection('users').countDocuments({ role: 'student', lab: ln });
                labSummaries.push({ lab_name: ln, equipment_count: ec, chemical_count: cc, student_count: sc, compliance_score: 95 });
            }

            res.json({ success: true, total_labs: totalLabs, total_equipment: totalEquip, total_chemicals: totalChem, low_stock_items: lowStock, expiring_soon: expiring, maintenance_due: maintenanceDue, total_value: '0', recent_activities: recentActivities, lab_summaries: labSummaries, alerts, user: userObj });
        } else if (role === 'labhead') {
            const totalStudents = await db.collection('users').countDocuments({ role: 'student', lab });
            const totalEquip = await db.collection('equipment').countDocuments({ lab });
            const totalChem = await db.collection('chemicals').countDocuments({ lab });
            const pendingApprovals = await db.collection('approval_requests').countDocuments({ lab, status: 'pending' });

            const chemicals = await db.collection('chemicals').find({ lab }).toArray();
            let lowStock = 0;
            const lowStockAlerts = [];
            chemicals.forEach(c => {
                if (parseFloat(c.quantity || 0) <= parseFloat(c.min_stock || 0)) {
                    lowStock++;
                    lowStockAlerts.push({ name: c.name, quantity: c.quantity, unit: c.unit, min_stock: c.min_stock });
                }
            });

            const todayAttendance = await db.collection('attendance').countDocuments({ lab, date: new Date().toISOString().split('T')[0] });
            const recentActivities = await db.collection('activities').find({ lab }).sort({ date: -1 }).limit(10).toArray();
            recentActivities.forEach(a => a.id = a._id.toString());
            const pendingTasks = await db.collection('tasks').find({ lab, status: 'pending' }).sort({ due_date: 1 }).limit(10).toArray();
            pendingTasks.forEach(t => t.id = t._id.toString());

            res.json({ success: true, total_students: totalStudents, total_equipment: totalEquip, total_chemicals: totalChem, pending_approvals: pendingApprovals, low_stock_items: lowStock, today_attendance: todayAttendance, recent_activities: recentActivities, pending_tasks: pendingTasks, low_stock_alerts: lowStockAlerts, user: userObj });
        } else if (role === 'student') {
            const userName = u ? u.full_name : '';
            const totalTasks = await db.collection('tasks').countDocuments({ assigned_to: userName });
            const completedTasks = await db.collection('tasks').countDocuments({ assigned_to: userName, status: 'completed' });
            const experimentsLogged = await db.collection('activities').countDocuments({ student: userName });
            const pendingRequests = await db.collection('approval_requests').countDocuments({ requested_by: userName, status: 'pending' });

            const rollNo = u ? (u.roll_no || u.user_code) : '';
            const records = await db.collection('attendance').find({ roll_no: rollNo }).toArray();
            const totalAtt = records.length;
            const attended = records.filter(r => ['present', 'late'].includes(r.status)).length;
            const attRate = totalAtt > 0 ? Math.round(attended / totalAtt * 100) + '%' : 'N/A';

            const recentActivities = await db.collection('activities').find({ student: userName }).sort({ date: -1 }).limit(10).toArray();
            recentActivities.forEach(a => a.id = a._id.toString());
            const upcomingTasks = await db.collection('tasks').find({ assigned_to: userName, status: { $ne: 'completed' } }).sort({ due_date: 1 }).limit(10).toArray();
            upcomingTasks.forEach(t => t.id = t._id.toString());

            res.json({ success: true, total_tasks: totalTasks, completed_tasks: completedTasks, attendance_rate: attRate, experiments_logged: experimentsLogged, pending_requests: pendingRequests, recent_activities: recentActivities, upcoming_tasks: upcomingTasks, user: userObj });
        } else {
            res.json({ success: false, message: 'Invalid role' });
        }
    } catch (e) {
        res.json({ success: false, message: e.message });
    }
});

// 17. REPORTS API
app.get('/api/reports.php', async (req, res) => {
    const action = req.query.action;
    try {
        if (action === 'inventory') {
            const equipment = await db.collection('equipment').find().sort({ name: 1 }).toArray();
            const chemicals = await db.collection('chemicals').find().sort({ name: 1 }).toArray();
            chemicals.forEach(c => { c.stock = c.quantity; c.minStock = c.min_stock; });
            res.json({ equipment, chemicals });
        } else if (action === 'attendance') {
            const attendance = await db.collection('attendance').find().sort({ date: -1 }).limit(100).toArray();
            attendance.forEach(a => { a.name = a.student_name; a.rollNo = a.roll_no; a.timeIn = a.time_in; a.timeOut = a.time_out; });
            const tasks = await db.collection('tasks').find().sort({ due_date: -1 }).limit(50).toArray();
            res.json({ attendance, tasks });
        } else if (action === 'maintenance') {
            const maintenance = await db.collection('equipment').find().sort({ next_maintenance: 1 }).toArray();
            maintenance.forEach(m => m.brand = m.manufacturer);
            res.json({ maintenance });
        } else if (action === 'master') {
            const totalLabs = await db.collection('labs').countDocuments();
            const activeEquip = await db.collection('equipment').countDocuments({ status: 'operational' });
            const maintEquip = await db.collection('equipment').countDocuments({ status: 'maintenance' });

            const chemicals = await db.collection('chemicals').find().toArray();
            let lowStock = 0;
            let critical = 0;
            const lowStockList = [];
            chemicals.forEach(c => {
                const qty = parseFloat(c.quantity || 0);
                const min = parseFloat(c.min_stock || 0);
                if (qty <= 0) {
                    critical++;
                    lowStock++;
                    lowStockList.push({ name: c.name, stock: qty, unit: c.unit, minStock: min });
                } else if (qty <= min) {
                    lowStock++;
                    lowStockList.push({ name: c.name, stock: qty, unit: c.unit, minStock: min });
                }
            });

            const expiring = await db.collection('chemicals').countDocuments({
                expiry: { $ne: null, $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }
            });

            res.json({
                summary: { totalLabs, activeEquip, maintEquip, lowStock, critical, expiring, total_labs: totalLabs, active_equipment: activeEquip, maintenance_equipment: maintEquip, low_stock_chemicals: lowStock, critical_chemicals: critical, expiring_chemicals: expiring },
                low_stock_list: lowStockList
            });
        } else if (action === 'compliance') {
            const labName = req.query.lab;
            const equip = await db.collection('equipment').find({ lab: labName }).toArray();
            const chems = await db.collection('chemicals').find({ lab: labName }).toArray();

            const totalEq = equip.length;
            const opEq = equip.filter(e => e.status === 'operational').length;
            const eqScore = totalEq > 0 ? Math.round(opEq / totalEq * 100) : 100;

            const totalCh = chems.length;
            const okCh = chems.filter(c => parseFloat(c.quantity || 0) > parseFloat(c.min_stock || 0)).length;
            const chScore = totalCh > 0 ? Math.round(okCh / totalCh * 100) : 100;

            const overall = Math.round((eqScore + chScore) / 2);

            const sections = [
                { name: 'Equipment Status', score: eqScore, items: equip.map(e => ({ label: e.name, status: e.status, notes: 'Last maintained: ' + (e.last_maintenance || 'N/A') })) },
                { name: 'Stock Levels', score: chScore, items: chems.map(c => ({ label: c.name, status: parseFloat(c.quantity || 0) > parseFloat(c.min_stock || 0) ? 'ok' : 'low', notes: `Stock: ${c.quantity} ${c.unit}` })) }
            ];

            res.json({ success: true, report: { lab: labName, date: new Date().toISOString().split('T')[0], overall_score: overall, sections } });
        }
    } catch (e) {
        res.json({ success: false, message: e.message });
    }
});

// 18. ANALYTICS API
app.get('/api/analytics.php', async (req, res) => {
    const action = req.query.action;
    try {
        if (action === 'monthly_usage') {
            const history = await db.collection('stock_history').find().toArray();
            const months = {};
            history.forEach(h => {
                if (h.date) {
                    const m = new Date(h.date).toLocaleString('default', { month: 'short' });
                    months[m] = (months[m] || 0) + 1;
                }
            });
            res.json({ success: true, labels: Object.keys(months), values: Object.values(months) });
        } else if (action === 'lab_utilization') {
            const equip = await db.collection('equipment').find().toArray();
            const labs = {};
            equip.forEach(e => {
                if (e.lab) labs[e.lab] = (labs[e.lab] || 0) + 1;
            });
            res.json({ success: true, labels: Object.keys(labs), values: Object.values(labs) });
        } else if (action === 'attendance_trend') {
            const att = await db.collection('attendance').find().toArray();
            const dates = {};
            att.forEach(a => {
                if (a.date) dates[a.date] = (dates[a.date] || 0) + 1;
            });
            const sortedDates = Object.keys(dates).sort();
            const values = sortedDates.map(d => dates[d]);
            res.json({ success: true, labels: sortedDates, values });
        } else if (action === 'category_breakdown') {
            const chems = await db.collection('chemicals').find().toArray();
            const cats = {};
            chems.forEach(c => {
                const cat = c.category || 'Chemical';
                cats[cat] = (cats[cat] || 0) + 1;
            });
            res.json({ success: true, labels: Object.keys(cats), values: Object.values(cats) });
        } else {
            // General
            const history = await db.collection('stock_history').find().toArray();
            const trends = {};
            history.forEach(h => {
                if (h.date) {
                    const ym = h.date.substring(0, 7);
                    trends[ym] = (trends[ym] || 0) + 1;
                }
            });
            const stockTrends = Object.keys(trends).sort().map(d => ({ date: d, total_items: trends[d], low_stock: 0, value: 0 }));

            const chems = await db.collection('chemicals').find().toArray();
            const cats = {};
            chems.forEach(c => {
                const cat = c.category || 'Chemical';
                cats[cat] = (cats[cat] || 0) + 1;
            });
            const catDist = Object.keys(cats).map(cat => ({ category: cat, count: cats[cat], value: 0 }));

            const usage = {};
            history.forEach(h => {
                if (h.item) usage[h.item] = (usage[h.item] || 0) + parseFloat(h.quantity || 0);
            });
            const usageData = Object.keys(usage).sort((a,b) => usage[b] - usage[a]).slice(0, 10).map(item => ({ item, used: usage[item], remaining: 0 }));

            const labComp = [];
            const labs = await db.collection('labs').find().toArray();
            for (const l of labs) {
                const ln = l.name;
                const ec = await db.collection('equipment').countDocuments({ lab: ln });
                const cc = await db.collection('chemicals').countDocuments({ lab: ln });
                labComp.push({ lab: ln, equipment: ec, chemicals: cc, compliance: 100 });
            }

            const total = await db.collection('notifications').countDocuments();
            const critical = await db.collection('notifications').countDocuments({ severity: 'critical' });
            const warning = await db.collection('notifications').countDocuments({ severity: 'warning' });
            const info = await db.collection('notifications').countDocuments({ severity: 'info' });

            const consumers = {};
            history.forEach(h => {
                if (h.by_user && h.lab) {
                    const k = h.by_user + '|' + h.lab;
                    consumers[k] = (consumers[k] || 0) + 1;
                }
            });
            const topConsumers = Object.keys(consumers).sort((a,b) => consumers[b] - consumers[a]).slice(0, 10).map(k => {
                const [name, labName] = k.split('|');
                return { name, items_used: consumers[k], lab: labName };
            });

            res.json({ success: true, stock_trends: stockTrends, category_distribution: catDist, usage_data: usageData, lab_comparison: labComp, alerts_summary: { total, critical, warning, info }, top_consumers: topConsumers });
        }
    } catch (e) {
        res.json({ success: false, message: e.message });
    }
});

// Serve frontend static files (placed after API routes to avoid overlapping route/file matches)
app.use(express.static(__dirname));

// Start Express server after DB connection init
initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`SmartStock Node.js backend running at http://localhost:${PORT}`);
    });
});
