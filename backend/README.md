<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

## Description

[BE combo phòng trà](https://www.takasolution.com/) Là một phần mềm đặt combo cho phòng trà

## Installation 

```bash
$ npm install --legacy-peer-deps
```

## Install docker

- MacOS: - [Cài Docker Desktop](https://www.docker.com/products/docker-desktop/)

- Windows - [Cài Docker Desktop](https://www.docker.com/products/docker-desktop/) Nhớ thêm biến môi trường trong win

## Running the app

```bash

# run docker
$ docker-compose up -d --build

# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Một số chú ý trong dự án

Khi tạo order, backend đặt timer 5 phút. Nếu order chưa có payment thì order bị xóa; nếu payment còn chờ thì payment bị hủy và order seat/order item được giải phóng.
Nếu có payment rồi thì sẽ kiểm tra nếu chưa thanh toán thì sẽ chuyển trạng thái payment thành cancel và đồng thời xóa thông tin order seat và order item

Một số tính năng, khách hàng K khi đặt vé trước 3 ngày sẽ giảm 10%
