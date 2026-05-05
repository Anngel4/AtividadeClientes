import { Router } from "express";
import pedidoController from "../controllers/pedidoController.js";
import upload from "../middlewares/upload.js";
const pedidoRoutes = Router();

//rotas do pedido
pedidoRoutes.post('/', pedidoController.criar);
pedidoRoutes.get('/', pedidoController.selecionar);

//rotas sobre os itens
pedidoRoutes.post('/:pedidoId/itens', pedidoController.adicionarItem);
pedidoRoutes.put('/:pedidoId/status', pedidoController.alterarStatus);
pedidoRoutes.put('/itens/:itemId', pedidoController.editarItem);
pedidoRoutes.delete('/itens/:itemId', pedidoController.deletarItem);

export default pedidoRoutes;