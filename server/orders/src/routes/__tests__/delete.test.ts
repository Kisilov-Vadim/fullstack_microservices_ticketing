import request from 'supertest';
import mongoose from 'mongoose';

import {app} from '../../app';
import {natsWrapper} from '../../nats-wrapper';
import {Order, OrderStatus, Ticket} from '../../models';

const buildTicket = async () => {
  const ticket = Ticket.build({
    price: 20,
    title: 'concert',
    id: new mongoose.Types.ObjectId().toHexString(),
  });

  await ticket.save();

  return ticket;
}

it("marks an order as cancelled", async () => {
  const ticket = await buildTicket();

  const user = global.signin();

  const {body: order} = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ticketId: ticket.id})
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .expect(204);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("emits an order cancelled event", async () => {
  const ticket = await buildTicket();

  const user = global.signin();

  const {body: order} = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ticketId: ticket.id})
    .expect(201);

  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});