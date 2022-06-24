const cds = require ('@sap/cds')
class OrdersService extends cds.ApplicationService {

  init(){
    const { 'Orders.Items':OrderItems } = this.entities

    this.before ('UPDATE', 'Orders', async function(req) {
      const { ID, Items } = req.data
      if (Items) for (let { product_ID, quantity } of Items) {
        const { quantity:before } = await cds.tx(req).run (
          SELECT.one.from (OrderItems, oi => oi.quantity) .where ({up__ID:ID, product_ID})
        )
        if (quantity != before) await this.orderChanged (product_ID, quantity-before)
      }
    })

    this.before ('DELETE', 'Orders', async function(req) {
      const { ID } = req.data
      const Items = await cds.tx(req).run (
        SELECT.from (OrderItems, oi => { oi.product_ID, oi.quantity }) .where ({up__ID:ID})
      )
      if (Items) await Promise.all (Items.map(it => this.orderChanged (it.product_ID, -it.quantity)))
    })

    return super.init()
  }
  orderChanged (product, deltaQuantity) {
    console.log ('> emitting:', 'OrderChanged', { product, deltaQuantity })
    return this.emit ('OrderChanged', { product, deltaQuantity })
  }

}
module.exports = OrdersService