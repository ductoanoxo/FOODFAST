# Prometheus Pushgateway

Pushgateway được sử dụng để nhận metrics từ GitHub Actions CI/CD workflows.

## Cấu hình trong Docker

Pushgateway đã được thêm vào `docker-compose.yml` và sẽ được deploy tự động.

## Endpoints

- **Pushgateway UI**: http://localhost:9091
- **Metrics endpoint**: http://localhost:9091/metrics

## CI/CD Metrics

GitHub Actions sẽ tự động push các metrics sau mỗi workflow run:

- `github_workflow_run_total` - Tổng số lần workflow chạy
- `github_workflow_success_total` - Số lần thành công
- `github_workflow_failure_total` - Số lần thất bại
- `github_workflow_duration_seconds` - Thời gian chạy workflow
- `github_workflow_status` - Trạng thái hiện tại của workflow
- `github_workflow_run_number` - Số thứ tự run

## Cách sử dụng

Metrics sẽ được push tự động từ GitHub Actions workflows. Không cần cấu hình thêm.
