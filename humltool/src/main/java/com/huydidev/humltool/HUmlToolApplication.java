package com.huydidev.humltool;

import com.huydidev.humltool.entity.DiagramEntity;
import com.huydidev.humltool.repository.DiagramRepository; // Phải import cái này
import org.springframework.beans.factory.annotation.Autowired; // Và cái này
import org.springframework.boot.CommandLineRunner; // Và cái này nữa
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing
// 1. Phải thêm "implements CommandLineRunner" ở đây
public class HUmlToolApplication implements CommandLineRunner {

	// 2. Phải tiêm Repository vào thì mới dùng được hàm save/count
	@Autowired
	private DiagramRepository repository;

	public static void main(String[] args) {
		SpringApplication.run(HUmlToolApplication.class, args);
	}

	// 3. Hàm này sẽ chạy ngay sau khi Spring khởi động xong
	@Override
	public void run(String... args) throws Exception {
		try {
			if (repository.count() == 0) {
				DiagramEntity test = new DiagramEntity();
				test.setTitle("Test Connection by Huy");
				repository.save(test);
				System.out.println("--------------------------------------------------");
				System.out.println(">>> Đã lưu bản ghi đầu tiên! Check Compass ngay!");
				System.out.println("--------------------------------------------------");
			}
		} catch (Exception e) {
			System.out.println(">>> Lỗi kết nối Mongo rồi: " + e.getMessage());
		}
	}
}