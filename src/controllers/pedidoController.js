import pedidoRepository from "../repositories/pedidoRepository.js";
import { ItensPedido } from "../models/ItensPedido.js";
import { Pedido } from "../models/Pedido.js";
import { statusPed } from "../enums/statusPedido.js";

const pedidoController = {
    //CRIAR PEDIDO
    criar: async (req, res) => {
        try {
            let { clienteId, itens } = req.body;

            const itensPedido = itens.map(item =>
                ItensPedido.criar({
                    produtoId: item.produtoId,
                    quantidade: item.quantidade,
                    valorItem: item.valorItem
                })
            );

            const subTotal = ItensPedido.calcularSubTotalItens(itensPedido)
            const pedido = Pedido.criar({ clienteId, subTotal, status: statusPed.ABERTO })

            const result = await pedidoRepository.criar(pedido, itensPedido);
            res.status(201).json({ result })
        } catch (error) {
            return res.status(500).json({
                message: "Erro ao criar pedido",
                error: error.message
            });
        }
    },
    //SELECIONAR PEDIDOS
    selecionar: async (req, res) => {
        try {
            const result = await pedidoRepository.selecionar();
            return res.json(result);
        } catch (error) {
            return res.status(500).json({
                message: "Erro ao buscar pedido",
                error: error.message
            });
        }
    },
    //CRIAR NOVO ITEM DO PEDIDO
    adicionarItem: async (req, res) => {
        try {
            const { pedidoId } = req.params;
            const item = req.body;

            await pedidoRepository.adicionarItem(pedidoId, item);

            res.status(200).json({ message: "Item adicionado" });

        } catch (error) {
            res.status(500).json({ errorMessage: error.message });
        }
    },
    //ALTERAR STATUS DO ITEM
    alterarStatus: async (req, res) => {
        try {
            const { pedidoId } = req.params;
            const { status } = req.body;

            await pedidoRepository.alterarStatus(pedidoId, status);

            res.status(200).json({ message: "Status atualizado" });

        } catch (error) {
            res.status(500).json({ errorMessage: error.message });
        }
    },
    //EDITAR ITEM
    editarItem: async (req, res) => {
        try {
            const { itemId } = req.params;
            const { quantidade } = req.body;

            await pedidoRepository.editarItem(itemId, quantidade);

            res.status(200).json({ message: "Item atualizado" });

        } catch (error) {
            res.status(500).json({ errorMessage: error.message });
        }
    },
    //EXCLUIR ITEM
    deletarItem: async (req, res) => {
        try {
            const { itemId } = req.params;

            await pedidoRepository.deletarItem(itemId);

            res.status(200).json({ message: "Você excluiu esse item." });

        } catch (error) {
            res.status(500).json({ errorMessage: error.message });
        }
    }
};

export default pedidoController;
