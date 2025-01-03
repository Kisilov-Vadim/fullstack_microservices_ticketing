import mongoose from "mongoose";
import {Message} from "node-nats-streaming";
import {ExpirationCompletedEvent} from "@vkorg/ticketing-common";

import {natsWrapper} from "../../../nats-wrapper";
import {Order, OrderStatus, Ticket} from "../../../models";

import {ExpirationCompleteListener} from "../expiration-complete-listener";

const setup = async () => {
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  const ticket = Ticket.build({
    price: 20,
    title: 'Concert',
    id: new mongoose.Types.ObjectId().toHexString(),
  })

  await ticket.save();

  const order = Order.build({
    ticket,
    userId: 'user',
    expiresAt: new Date(),
    status: OrderStatus.Created,
  })

  await order.save();

  const data: ExpirationCompletedEvent['data'] = {orderId: order.id};

  // @ts-expect-error - mock implementation
  const msg: Message = {ack: jest.fn()}

  return {listener, order, ticket, msg, data};
}

it('updates the order status to cancelled', async () => {
  const {listener, order, msg, data} = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emits an OrderCancelled event', async () => {
  const {listener, order, msg, data} = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);

  expect(eventData.id).toEqual(order.id);
});

it('acks the message', async () => {
  const {listener, msg, data} = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});