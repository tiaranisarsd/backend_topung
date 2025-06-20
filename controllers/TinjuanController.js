import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

export const getTinjauan = async (req, res) =>{
    try {
        const response = await prisma.tinjauan.findMany();
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}

export const getTinjauanById = async (req, res) =>{
    try {
        const response = await prisma.tinjauan.findUnique({
            where:{
                id: Number(req.params.id)
            }
        });
        if(!response) return res.status(404).json({msg: "Data tidak ditemukan"});
        res.status(200).json(response);
    } catch (error) {
        res.status(404).json({msg: error.message});
    }
}

export const createTinjauan = async (req, res) =>{
    const {nama, layanan, rating, tinjauan} = req.body;
    try {
        await prisma.tinjauan.create({
            data:{
                nama: nama,
                layanan: layanan,
                rating: rating,
                tinjauan: tinjauan
            }
        });
        res.status(201).json({ msg: "Tinjauan Created Successfully" });
    } catch (error) {
        res.status(400).json({msg: error.message});
    }
}

export const updateTinjauan = async (req, res) =>{
    const response = await prisma.tinjauan.findUnique({
        where:{
            id: Number(req.params.id)
        }
    });
    if(!response) return res.status(404).json({msg: "Tinjauan tidak ditemukan"});
    const {nama, layanan, rating, tinjauan} = req.body;
    try {
        await prisma.tinjauan.update({
            where:{
                id: Number(req.params.id)
            },
            data:{
                nama: nama,
                layanan: layanan,
                rating: rating,
                tinjauan: tinjauan
            }
        });
        res.status(200).json({msg: "Tinjauan updated successfully"});
    } catch (error) {
        res.status(400).json({msg: error.message});
    }
}

export const deleteTinjauan = async (req, res) =>{
    const response = await prisma.tinjauan.findUnique({
        where:{
            id: Number(req.params.id)
        }
    });
    if(!response) return res.status(404).json({msg: "Tinjauan tidak ditemukan"});
    try {
        await prisma.tinjauan.delete({
            where:{
                id: Number(req.params.id)
            }
        });
        res.status(201).json({msg: "Tinjauan deleted successfully"});
    } catch (error) {
        res.status(400).json({msg: error.message});
    }
}