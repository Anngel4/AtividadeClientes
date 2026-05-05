import { connection } from "../configs/Database.js";

const pedidoRepository = {
    //------------------
    //------ CRUD REPOSITORY
    //------------------

    //CRIAR PEDIDO
    criar: async (pedido, itens) => {
        const conn = await connection.getConnection();
        try {
            conn.beginTransaction();

            const sqlPed = 'INSERT INTO pedidos (ClienteId, SubTotal, Status) VALUES (?,?,?);';
            const valuesPed = [pedido.clienteId, pedido.subTotal, pedido.status];
            const [rowsPed] = await connection.execute(sqlPed, valuesPed);

            itens.forEach(async item => {
                const sqlItens = 'INSERT INTO itens_pedido (PedidoId, ProdutoId, Quantidade, ValorItem) VALUES (?,?,?,?);';
                const valuesItens = [rowsPed.insertId, item.PedidoId, item.ProdutoId, item.Quantidade, item.ValorItem];
                await connection.execute(sqlItens, valuesItens);
            });

            conn.commit();
            return { rowsPed }

        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    },
    //SELECIONAR PEDIDOS(get)
    selecionar: async (produto) => {
        const sql = 'SELECT * FROM pedidos';
        const [rows] = await connection.execute(sql);
        return rows
    },
    //ADICIONAR NOVO ITEM DO PEDIDO
    adicionarItem: async (pedidoId, item) => {
        const conn = await connection.getConnection();

        try {
            await conn.beginTransaction();

            await conn.execute(
                `INSERT INTO itens_pedidos (PedidoId, ProdutoId, Quantidade, ValorItem)
                 VALUES (?, ?, ?, ?)`,
                [pedidoId, item.produtoId, item.quantidade, item.valorItem]
            );

            // recalcular o subtotal
            const [itens] = await conn.execute(
                `SELECT Quantidade, ValorItem FROM itens_pedidos WHERE PedidoId = ?`,
                [pedidoId]
            );
            const subTotal = itens.reduce(
                (total, i) => total + (i.Quantidade * i.ValorItem),
                0
            );
            await conn.execute(
                `UPDATE pedidos SET SubTotal = ? WHERE id = ?`,
                [subTotal, pedidoId]
            );

            await conn.commit();

        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    },
    //ALTERAR STATUS
    alterarStatus: async (pedidoId, status) => {
        await connection.execute(
            `UPDATE pedidos SET Status = ? WHERE id = ?`,
            [status, pedidoId]
        );
    },
    //EDITAR ITEM JÁ EXISTENTE
    editarItem: async (itemId, quantidade) => {
        const conn = await connection.getConnection();

        try {
            await conn.beginTransaction();

            await conn.execute(
                `UPDATE itens_pedidos SET Quantidade = ? WHERE id = ?`,
                [quantidade, itemId]
            );

            const [[item]] = await conn.execute(
                `SELECT PedidoId FROM itens_pedidos WHERE id = ?`,
                [itemId]
            );

            const pedidoId = item.PedidoId;

            const [itens] = await conn.execute(
                `SELECT Quantidade, ValorItem FROM itens_pedidos WHERE PedidoId = ?`,
                [pedidoId]
            );

            //reduzir o subTotal. O i significa cada item dentro do array ITENS
            const subTotal = itens.reduce(
                (total, i) => total + (i.Quantidade * i.ValorItem),
                0
            );

            await conn.execute(
                `UPDATE pedidos SET SubTotal = ? WHERE id = ?`,
                [subTotal, pedidoId]
            );

            await conn.commit();

        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    },
    //DELETAR ITEM
    deletarItem: async (itemId) => {
        const conn = await connection.getConnection();

        try {
            await conn.beginTransaction();

            const result = await conn.execute(
                `SELECT PedidoId FROM itens_pedidos WHERE id = ?`,
                [itemId]
            );

            //pega o primeiro registro que veio do Banco de Dados, ja q o mysql retorna os dados dentro de dois arrays (posições)
            const item = result[0][0];

            if (!item) {
                throw new Error("Item não encontrado");
            }

            const pedidoId = item.PedidoId;

            await conn.execute(
                `DELETE FROM itens_pedidos WHERE id = ?`,
                [itemId]
            );

            const [itens] = await conn.execute(
                `SELECT Quantidade, ValorItem FROM itens_pedidos WHERE PedidoId = ?`,
                [pedidoId]
            );

            //reduzir o subTotal. O i significa cada item dentro do array ITENS
            const subTotal = itens.reduce(
                (total, i) => total + (i.Quantidade * i.ValorItem),
                0
            );

            await conn.execute(
                `UPDATE pedidos SET SubTotal = ? WHERE id = ?`,
                [subTotal, pedidoId]
            );

            await conn.commit();

        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    }

};


export default pedidoRepository;