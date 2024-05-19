# Docker

## Docker là gì?

### Vấn đề?

Chúng ta có 1 server node.js chạy trên version 10, và ubuntu 18.04. Một ngày đẹp trời chúng ta cần phải bảo trì và thêm chức năng cho nó, điều này đòi hỏi bạn phải cho code chạy ở local để test. Nhưng máy bạn là Ubuntu 22 (hoặc Macos) và không có version Node đó, nên không chạy được.

Điều này đòi hỏi bạn phải cài thêm 1 máy ảo đúng với thông số dự án. Cài xong còn phải setup môi trường rất rườm rà. Những phần mềm hỗ trợ máy ảo phổ biến như VMWare thì khá nặng và tốn tài nguyên.

Đấy chỉ là 1 dự án, nếu nhiều dự án thì còn mệt hơn.

### Giải pháp?

Docker sinh ra để đơn giản hóa quá trình trên.

Docker là nền tảng ảo hóa cho phép đóng gói ứng dụng vào 1 container độc lập với máy chủ. Docker giúp đồng bộ môi trường giữa các máy chủ, giúp chúng ta dễ dàng chuyển đổi giữa các môi trường khác nhau.

Tức là bạn chỉ cần cài docker, không cần cài nhiều máy ảo khác nhau.

Muốn chạy 1 app gì đó thì có 2 cách:

1. Bạn tải source code đó về, build thành image, rồi chạy image đó thành container.
2. Bạn tải image của app đó về, rồi chạy image đó thành container.

## Image vs Container

Docker Image là phần mềm (có thể là app hoặc hệ thống) được đóng gói.

Docker Container là một instance của Docker Image. Một Docker Image có thể tạo ra nhiều Docker Container.

Hãy tưởng tượng chúng ta cài Chrome để lướt web. Muốn cài Chrome thì tải file đóng gói `chrome.exe` về và cài đặt. Sau khi cài đặt xong chúng ta có được shortcut Chrome trên desktop. Click vào shortcut này để chạy Chrome lướt web. Khi đó Chrome đang chạy là một instance của `chrome.exe`. Muốn có một instance khác thì chúng ta không cần cài lại mà chỉ cần tạo một profile mới là được.

Vậy ở đây `chrome.exe` là Docker Image, Profile Chrome đang chạy là Docker Container, và profile khác là một Docker Container khác.

## Lệnh docker

### Thông tin docker

```bash
docker version
```

### Show các image

```bash
docker image ls
```

### Xóa image

```bash
docker image rm HASH
```

### Show các container đang chạy (thêm `-a` để show luôn bị dừng)

```bash
docker container ls
# hoặc cái này cũng được
docker ps
```

### Dừng container

```bash
docker container stop HASH
```

### Xóa container

```bash
docker container rm HASH
```

### Build Image từ `Dockerfile`. `khoi/nodejs:v2` là tên image, đặt tên theo cú pháp `USERNAME/TÊN_IMAGE:TAG`

```bash
docker build --progress=plain -t khoi/nodejs:v2 -f Dockerfile.dev .
```

Nếu muốn chỉ định file `Dockerfile` nào đó thì thêm `-f` và đường dẫn tới file đó.

Thi thoảng sẽ có thể gặp lỗi do cache, vậy thì thêm `--no-cache` vào

```bash
docker build --progress=plain -t dev/twitter:v2 -f Dockerfile.dev .
```

### Tạo và chạy container dựa trên image

```bash
docker container run -dp PORT_NGOAI:PORT_TRONG_DOCKER TEN_IMAGE
```

ví dụ

```bash
docker container run -dp 4000:4000 dev/twitter:v2
```

Nếu muốn mapping folder trong container và folder ở ngoài thì thêm `-v`. Cái này gọi là volume.

```bash
docker container run -dp 4000:4000 -v ~/Documents/Github/NodeJs-Super/Twitter/uploads:/app/uploads dev/twitter:v2
```

### Show log của container

```bash
docker logs -f HASH_CONTAINER
```

### Truy cập vào terminal của container

```bash
docker exec -it HASH_CONTAINER sh
```

Muốn thoát ra thì gõ `exit`

### Để chạy các câu lệnh trong `docker-compose.yml` thì dùng lệnh. Đôi khi cache lỗi thì thêm `--force-recreate --build`

```bash
docker-compose up
```

## Lệnh khác

Dừng và xóa hết tất cả container đang chạy

```bash
docker stop $(docker ps -aq) && docker rm $(docker ps -aq)
```

Thêm chế độ tự động khởi động lại container khi reboot server. Trong trường hợp đã có container từ trước thì dùng

```bash
docker update --restart unless-stopped HASH_CONTAINER
```

Còn chưa có container thì thêm vào câu lệnh `docker run` option là `--restart unless-stopped`

```bash
docker run -dp 3000:3000 --name twitter-clone --restart unless-stopped -v ~/twitter-clone/uploads:/app/uploads trandangkhoi/twitter:v4
```
